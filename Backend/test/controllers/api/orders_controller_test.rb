require "test_helper"

module Api
  class OrdersControllerTest < ActionDispatch::IntegrationTest
    def generate_token(user)
      payload = { user_id: user.id, role: user.role, exp: 24.hours.from_now.to_i }
      JWT.encode(payload, Rails.application.secret_key_base, "HS256")
    end

    def auth_headers(user)
      { "Authorization" => "Bearer #{generate_token(user)}" }
    end

    def valid_order_params(product, quantity: 1)
      {
        order: {
          customer: { firstName: "Mario", lastName: "Rossi", email: "mario@example.com" },
          address: { street: "Via Roma 1", city: "Milano", zip: "20100" },
          total: product.price * quantity,
          items: [ { id: product.id, title: product.title, price: product.price, quantity: quantity } ]
        }
      }
    end

    # ─── GET /api/orders ─────────────────────────────────────────────────────

    test "index: returns only own orders for regular user" do
      user = users(:regular_user)
      get api_orders_url, headers: auth_headers(user)

      assert_response :ok
      json = JSON.parse(response.body)
      assert json.is_a?(Array)
      assert json.all? { |o| o["user"]["id"] == user.id }
    end

    test "index: returns 401 without token" do
      get api_orders_url
      assert_response :unauthorized
    end

    test "index: admin sees all orders" do
      admin = users(:admin_user)
      get api_orders_url, headers: auth_headers(admin)

      assert_response :ok
      json = JSON.parse(response.body)
      # Gli ordini in fixture appartengono a utenti diversi (o guest)
      user_ids = json.filter_map { |o| o.dig("user", "id") }.uniq
      assert user_ids.length >= 1
    end

    test "index: orders are sorted by most recent first" do
      user = users(:regular_user)
      get api_orders_url, headers: auth_headers(user)

      assert_response :ok
      json = JSON.parse(response.body)
      dates = json.map { |o| o["createdAt"] }
      assert_equal dates.sort.reverse, dates
    end

    test "index: min_total filter excludes orders below threshold" do
      admin = users(:admin_user)
      get api_orders_url, params: { min_total: 200 }, headers: auth_headers(admin)

      assert_response :ok
      json = JSON.parse(response.body)
      assert json.all? { |o| o["total"] >= 200 }
    end

    test "index: max_total filter excludes orders above threshold" do
      admin = users(:admin_user)
      get api_orders_url, params: { max_total: 100 }, headers: auth_headers(admin)

      assert_response :ok
      json = JSON.parse(response.body)
      assert json.all? { |o| o["total"] <= 100 }
    end

    test "index: product_title filter returns only matching orders" do
      admin = users(:admin_user)
      get api_orders_url,
        params: { product_title: products(:valid_product).title },
        headers: auth_headers(admin)

      assert_response :ok
      json = JSON.parse(response.body)
      assert json.length >= 1
      json.each do |order|
        titles = order["orderItems"].map { |i| i.dig("product", "title") }
        assert titles.any? { |t| t.include?(products(:valid_product).title) }
      end
    end

    test "index: invalid date filter is ignored gracefully" do
      user = users(:regular_user)
      get api_orders_url,
        params: { start_date: "not-a-date", end_date: "also-wrong" },
        headers: auth_headers(user)

      assert_response :ok
    end

    # ─── POST /api/orders ────────────────────────────────────────────────────

    test "create: guest user can place an order without token" do
      product = products(:valid_product)

      assert_difference("Order.count", 1) do
        post api_orders_url,
          params: valid_order_params(product),
          as: :json
      end

      assert_response :created
      json = JSON.parse(response.body)
      assert_not json.key?("user")
    end

    test "create: authenticated order is linked to the user" do
      user = users(:regular_user)
      product = products(:valid_product)

      post api_orders_url,
        params: valid_order_params(product),
        headers: auth_headers(user),
        as: :json

      assert_response :created
      assert_equal user.id, Order.last.user_id
    end

    test "create: returns 422 when product does not exist" do
      assert_no_difference("Order.count") do
        post api_orders_url,
          params: {
            order: {
              customer: { firstName: "Mario", lastName: "Rossi", email: "mario@example.com" },
              address: { street: "Via Roma 1", city: "Milano", zip: "20100" },
              total: 50.00,
              items: [ { id: "nonexistent", title: "Ghost", price: 50.00, quantity: 1 } ]
            }
          },
          as: :json
      end

      assert_response :unprocessable_entity
      json = JSON.parse(response.body)
      assert_match(/not found/i, json["error"])
    end

    test "create: decrements product quantity after successful order" do
      product = products(:valid_product)
      stock_before = product.quantity

      post api_orders_url,
        params: valid_order_params(product, quantity: 3),
        as: :json

      assert_response :created
      assert_equal stock_before - 3, product.reload.quantity
    end

    test "create: does not decrement stock when order fails" do
      product = products(:valid_product)
      stock_before = product.quantity

      post api_orders_url,
        params: valid_order_params(product, quantity: stock_before + 1),
        as: :json

      assert_response :unprocessable_entity
      assert_equal stock_before, product.reload.quantity
    end

    test "create: returns 422 when total is missing" do
      product = products(:valid_product)
      params = valid_order_params(product)
      params[:order].delete(:total)

      assert_no_difference("Order.count") do
        post api_orders_url, params: params, as: :json
      end

      assert_response :unprocessable_entity
    end

    test "should create order with valid parameters" do
      user = users(:regular_user)
      product = products(:valid_product)
      token = generate_token(user)

      order_params = {
        order: {
          customer: {
            firstName: "Mario",
            lastName: "Rossi",
            email: "mario.rossi@example.com"
          },
          address: {
            street: "Via Roma 123",
            city: "Milano",
            zip: "20100"
          },
          total: 99.99,
          items: [
            {
              id: product.id,
              title: product.title,
              price: product.price,
              quantity: 2
            }
          ]
        }
      }

      assert_difference("Order.count", 1) do
        post api_orders_url,
          params: order_params,
          headers: { 'Authorization': "Bearer #{token}" },
          as: :json
      end

      assert_response :created
    end

    test "should not create order with insufficient stock" do
      user = users(:regular_user)
      product = products(:valid_product)
      token = generate_token(user)

      order_params = {
        order: {
          customer: {
            firstName: "Mario",
            lastName: "Rossi",
            email: "mario.rossi@example.com"
          },
          address: {
            street: "Via Roma 123",
            city: "Milano",
            zip: "20100"
          },
          total: 999.90,
          items: [
            {
              id: product.id,
              title: product.title,
              price: product.price,
              quantity: 100  # > 10
            }
          ]
        }
      }

      assert_no_difference("Order.count") do
        post api_orders_url,
          params: order_params,
          headers: { 'Authorization': "Bearer #{token}" },
          as: :json
      end

      assert_response :unprocessable_entity
      json_response = JSON.parse(response.body)
      assert_includes json_response["error"], "insufficient stock"
    end
  end
end
