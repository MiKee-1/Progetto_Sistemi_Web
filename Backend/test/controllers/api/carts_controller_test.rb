require "test_helper"

module Api
  class CartsControllerTest < ActionDispatch::IntegrationTest
    def generate_token(user)
      payload = {
        user_id: user.id,
        role: user.role,
        exp: 24.hours.from_now.to_i
      }
      JWT.encode(payload, Rails.application.secret_key_base, "HS256")
    end

    def auth_headers(user)
      { "Authorization" => "Bearer #{generate_token(user)}" }
    end

    # ─── GET /api/cart ────────────────────────────────────────────────────────

    test "show: returns cart for authenticated user" do
      user = users(:regular_user)
      get api_cart_url, headers: auth_headers(user)

      assert_response :ok
      json = JSON.parse(response.body)
      assert_equal user.id, json["userId"]
      assert json.key?("items")
      assert json.key?("total")
    end

    test "show: returns 401 without token" do
      get api_cart_url
      assert_response :unauthorized
    end

    test "show: auto-creates cart if user has none" do
      user = users(:admin_user) # nessun carrello in fixture
      get api_cart_url, headers: auth_headers(user)

      assert_response :ok
      json = JSON.parse(response.body)
      assert_equal user.id, json["userId"]
      assert_equal [], json["items"]
    end

    # ─── POST /api/cart/items ─────────────────────────────────────────────────

    test "add_item: adds a new product to the cart" do
      user = users(:admin_user)
      product = products(:valid_product)

      assert_difference("CartItem.count", 1) do
        post api_cart_items_url,
          params: { product_id: product.id, quantity: 1 },
          headers: auth_headers(user),
          as: :json
      end

      assert_response :ok
      json = JSON.parse(response.body)
      assert_equal "Product added to cart", json["message"]
      assert_equal product.id.to_s, json["item"]["productId"]
    end

    test "add_item: returns 401 without token" do
      post api_cart_items_url,
        params: { product_id: products(:valid_product).id, quantity: 1 },
        as: :json
      assert_response :unauthorized
    end

    test "add_item: returns 404 for non-existent product" do
      user = users(:admin_user)
      post api_cart_items_url,
        params: { product_id: "nonexistent", quantity: 1 },
        headers: auth_headers(user),
        as: :json

      assert_response :not_found
      json = JSON.parse(response.body)
      assert_equal "Product not found", json["error"]
    end

    test "add_item: increments quantity if product already in cart" do
      user = users(:regular_user)
      existing_item = cart_items(:item_one) # qty 2

      assert_no_difference("CartItem.count") do
        post api_cart_items_url,
          params: { product_id: existing_item.product_id, quantity: 3 },
          headers: auth_headers(user),
          as: :json
      end

      assert_response :ok
      existing_item.reload
      assert_equal 5, existing_item.quantity
    end

    test "add_item: returns 422 for out-of-stock product" do
      user = users(:admin_user)
      product = products(:out_of_stock_product)

      post api_cart_items_url,
        params: { product_id: product.id, quantity: 1 },
        headers: auth_headers(user),
        as: :json

      assert_response :unprocessable_entity
      json = JSON.parse(response.body)
      assert_equal "Failed to add item to cart", json["error"]
    end

    test "add_item: returns 422 when quantity exceeds stock" do
      user = users(:admin_user)
      product = products(:valid_product) # stock: 10

      post api_cart_items_url,
        params: { product_id: product.id, quantity: 99 },
        headers: auth_headers(user),
        as: :json

      assert_response :unprocessable_entity
      json = JSON.parse(response.body)
      assert_equal "Failed to add item to cart", json["error"]
    end

    # ─── PATCH /api/cart/items/:id ────────────────────────────────────────────

    test "update_item: updates quantity successfully" do
      user = users(:regular_user)
      item = cart_items(:item_one)

      patch "/api/cart/items/#{item.id}",
        params: { quantity: 5 },
        headers: auth_headers(user),
        as: :json

      assert_response :ok
      json = JSON.parse(response.body)
      assert_equal "Cart item updated", json["message"]
      assert_equal 5, json["item"]["quantity"]
    end

    test "update_item: returns 401 without token" do
      item = cart_items(:item_one)
      patch "/api/cart/items/#{item.id}",
        params: { quantity: 2 },
        as: :json
      assert_response :unauthorized
    end

    test "update_item: returns 404 for item not in user's cart" do
      user = users(:admin_user) # nessun carrello con item_one
      item = cart_items(:item_one)

      patch "/api/cart/items/#{item.id}",
        params: { quantity: 1 },
        headers: auth_headers(user),
        as: :json

      assert_response :not_found
      json = JSON.parse(response.body)
      assert_equal "Cart item not found", json["error"]
    end

    test "update_item: returns 422 with quantity zero" do
      user = users(:regular_user)
      item = cart_items(:item_one)

      patch "/api/cart/items/#{item.id}",
        params: { quantity: 0 },
        headers: auth_headers(user),
        as: :json

      assert_response :unprocessable_entity
      json = JSON.parse(response.body)
      assert_equal "Failed to update cart item", json["error"]
    end

    test "update_item: returns 422 with negative quantity" do
      user = users(:regular_user)
      item = cart_items(:item_one)

      patch "/api/cart/items/#{item.id}",
        params: { quantity: -1 },
        headers: auth_headers(user),
        as: :json

      assert_response :unprocessable_entity
    end

    test "update_item: returns 422 when quantity exceeds product stock" do
      user = users(:regular_user)
      item = cart_items(:item_one) # prodotto con stock 10

      patch "/api/cart/items/#{item.id}",
        params: { quantity: 999 },
        headers: auth_headers(user),
        as: :json

      assert_response :unprocessable_entity
    end

    # ─── DELETE /api/cart/items/:id ───────────────────────────────────────────

    test "remove_item: removes item from cart" do
      user = users(:regular_user)
      item = cart_items(:item_one)

      assert_difference("CartItem.count", -1) do
        delete "/api/cart/items/#{item.id}", headers: auth_headers(user)
      end

      assert_response :ok
      json = JSON.parse(response.body)
      assert_equal "Item removed from cart", json["message"]
    end

    test "remove_item: returns 401 without token" do
      item = cart_items(:item_one)
      delete "/api/cart/items/#{item.id}"
      assert_response :unauthorized
    end

    test "remove_item: returns 404 for item not in user's cart" do
      user = users(:admin_user)
      item = cart_items(:item_one)

      delete "/api/cart/items/#{item.id}", headers: auth_headers(user)

      assert_response :not_found
      json = JSON.parse(response.body)
      assert_equal "Cart item not found", json["error"]
    end

    # ─── DELETE /api/cart ─────────────────────────────────────────────────────

    test "clear: removes all items from cart" do
      user = users(:regular_user)

      assert_difference("CartItem.count", -CartItem.where(cart: user.cart).count) do
        delete "/api/cart", headers: auth_headers(user)
      end

      assert_response :ok
      json = JSON.parse(response.body)
      assert_equal "Cart cleared", json["message"]
      assert_equal [], json["cart"]["items"]
    end

    test "clear: returns 401 without token" do
      delete "/api/cart"
      assert_response :unauthorized
    end
  end
end
