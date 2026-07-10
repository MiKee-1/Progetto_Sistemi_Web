require "test_helper"

module Api
  module Admin
    class ProductsControllerTest < ActionDispatch::IntegrationTest
      def generate_token(user)
        payload = { user_id: user.id, role: user.role, exp: 24.hours.from_now.to_i }
        JWT.encode(payload, Rails.application.secret_key_base, "HS256")
      end

      def auth_headers(user)
        { "Authorization" => "Bearer #{generate_token(user)}" }
      end

      def valid_product_params
        {
          product: {
            id: "brand-new-product",
            title: "Brand New Product",
            description: "Created from the admin dashboard",
            price: 25.50,
            original_price: 30.00,
            sale: true,
            thumbnail: "new.jpg",
            quantity: 5,
            tags: [ "new", "admin" ]
          }
        }
      end

      # ─── Autorizzazione (require_admin!) ─────────────────────────────────────

      test "create: returns 401 without token" do
        post api_admin_products_url, params: valid_product_params
        assert_response :unauthorized
      end

      test "create: returns 403 for non-admin user" do
        assert_no_difference "Product.count" do
          post api_admin_products_url, params: valid_product_params,
               headers: auth_headers(users(:regular_user))
        end

        assert_response :forbidden
        assert_match(/admin only/i, JSON.parse(response.body)["error"])
      end

      test "update: returns 403 for non-admin user" do
        product = products(:valid_product)
        patch api_admin_product_url(product), params: { product: { title: "Hacked" } },
              headers: auth_headers(users(:regular_user))

        assert_response :forbidden
        assert_equal "Test Product", product.reload.title
      end

      test "destroy: returns 403 for non-admin user" do
        assert_no_difference "Product.count" do
          delete api_admin_product_url(products(:valid_product)),
                 headers: auth_headers(users(:regular_user))
        end

        assert_response :forbidden
      end

      test "adjust_quantity: returns 403 for non-admin user" do
        product = products(:valid_product)
        patch adjust_quantity_api_admin_product_url(product), params: { adjustment: 5 },
              headers: auth_headers(users(:regular_user))

        assert_response :forbidden
        assert_equal 10, product.reload.quantity
      end

      # ─── POST /api/admin/products ────────────────────────────────────────────

      test "create: admin creates a product with valid params" do
        assert_difference "Product.count", 1 do
          post api_admin_products_url, params: valid_product_params,
               headers: auth_headers(users(:admin_user))
        end

        assert_response :created
        json = JSON.parse(response.body)
        assert_equal "Product created successfully", json["message"]
        assert_equal "Brand New Product", json["product"]["title"]
      end

      test "create: returns 422 with errors when title is missing" do
        params = valid_product_params
        params[:product].delete(:title)

        assert_no_difference "Product.count" do
          post api_admin_products_url, params: params,
               headers: auth_headers(users(:admin_user))
        end

        assert_response :unprocessable_entity
        json = JSON.parse(response.body)
        assert_equal "Failed to create product", json["error"]
        assert json["errors"].any? { |e| e.match?(/title/i) }
      end

      test "create: returns 422 when id is missing" do
        params = valid_product_params
        params[:product].delete(:id)

        assert_no_difference "Product.count" do
          post api_admin_products_url, params: params,
               headers: auth_headers(users(:admin_user))
        end

        assert_response :unprocessable_entity
        assert JSON.parse(response.body)["errors"].any? { |e| e.match?(/id/i) }
      end

      test "create: returns 422 when id is already taken" do
        params = valid_product_params
        params[:product][:id] = products(:valid_product).id

        assert_no_difference "Product.count" do
          post api_admin_products_url, params: params,
               headers: auth_headers(users(:admin_user))
        end

        assert_response :unprocessable_entity
        assert JSON.parse(response.body)["errors"].any? { |e| e.match?(/taken/i) }
      end

      test "create: returns 422 when price is not positive" do
        params = valid_product_params
        params[:product][:price] = 0

        post api_admin_products_url, params: params,
             headers: auth_headers(users(:admin_user))

        assert_response :unprocessable_entity
        assert JSON.parse(response.body)["errors"].any? { |e| e.match?(/price/i) }
      end

      test "create: ignores non-permitted parameters" do
        params = valid_product_params
        params[:product][:created_at] = 1.year.ago

        post api_admin_products_url, params: params,
             headers: auth_headers(users(:admin_user))

        assert_response :created
        created = Product.find(JSON.parse(response.body)["product"]["id"])
        assert_in_delta Time.current.to_i, created.created_at.to_i, 60
      end

      # ─── PATCH/PUT /api/admin/products/:id ───────────────────────────────────

      test "update: admin modifies an existing product" do
        product = products(:valid_product)
        patch api_admin_product_url(product),
              params: { product: { title: "Updated Title", price: 149.99 } },
              headers: auth_headers(users(:admin_user))

        assert_response :ok
        assert_equal "Product updated successfully", JSON.parse(response.body)["message"]
        product.reload
        assert_equal "Updated Title", product.title
        assert_equal 149.99, product.price.to_f
      end

      test "update: returns 422 with errors for invalid values" do
        product = products(:valid_product)
        patch api_admin_product_url(product), params: { product: { price: -5 } },
              headers: auth_headers(users(:admin_user))

        assert_response :unprocessable_entity
        json = JSON.parse(response.body)
        assert_equal "Failed to update product", json["error"]
        assert_equal 99.99, product.reload.price.to_f
      end

      test "update: returns 404 for nonexistent product" do
        patch api_admin_product_url(999_999), params: { product: { title: "X" } },
              headers: auth_headers(users(:admin_user))

        assert_response :not_found
        assert_equal "Product not found", JSON.parse(response.body)["error"]
      end

      # ─── DELETE /api/admin/products/:id ──────────────────────────────────────

      test "destroy: admin deletes an existing product" do
        assert_difference "Product.count", -1 do
          delete api_admin_product_url(products(:valid_product)),
                 headers: auth_headers(users(:admin_user))
        end

        assert_response :ok
        assert_equal "Product deleted successfully", JSON.parse(response.body)["message"]
      end

      test "destroy: cascades to cart, order and wishlist items" do
        product = products(:valid_product)

        assert_difference [ "CartItem.count", "OrderItem.count", "WishlistItem.count" ], -1 do
          delete api_admin_product_url(product), headers: auth_headers(users(:admin_user))
        end

        assert_response :ok
      end

      test "destroy: returns 404 for nonexistent product" do
        delete api_admin_product_url(999_999), headers: auth_headers(users(:admin_user))

        assert_response :not_found
        assert_equal "Product not found", JSON.parse(response.body)["error"]
      end

      # ─── PATCH /api/admin/products/:id/adjust_quantity ───────────────────────

      test "adjust_quantity: positive adjustment increases stock" do
        product = products(:valid_product)
        patch adjust_quantity_api_admin_product_url(product), params: { adjustment: 7 },
              headers: auth_headers(users(:admin_user))

        assert_response :ok
        json = JSON.parse(response.body)
        assert_equal "Quantity adjusted successfully", json["message"]
        assert_equal 17, product.reload.quantity
      end

      test "adjust_quantity: negative adjustment decreases stock" do
        product = products(:valid_product)
        patch adjust_quantity_api_admin_product_url(product), params: { adjustment: -10 },
              headers: auth_headers(users(:admin_user))

        assert_response :ok
        assert_equal 0, product.reload.quantity
      end

      test "adjust_quantity: returns 422 when stock would go negative" do
        product = products(:valid_product)
        patch adjust_quantity_api_admin_product_url(product), params: { adjustment: -11 },
              headers: auth_headers(users(:admin_user))

        assert_response :unprocessable_entity
        assert_equal "Quantity cannot be negative", JSON.parse(response.body)["error"]
        assert_equal 10, product.reload.quantity
      end

      test "adjust_quantity: returns 404 for nonexistent product" do
        patch adjust_quantity_api_admin_product_url(999_999), params: { adjustment: 1 },
              headers: auth_headers(users(:admin_user))

        assert_response :not_found
        assert_equal "Product not found", JSON.parse(response.body)["error"]
      end
    end
  end
end
