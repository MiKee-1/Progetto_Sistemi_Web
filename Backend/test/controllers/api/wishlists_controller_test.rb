require "test_helper"

module Api
  class WishlistsControllerTest < ActionDispatch::IntegrationTest
    def generate_token(user)
      payload = { user_id: user.id, role: user.role, exp: 24.hours.from_now.to_i }
      JWT.encode(payload, Rails.application.secret_key_base, "HS256")
    end

    def auth_headers(user)
      { "Authorization" => "Bearer #{generate_token(user)}" }
    end

    # ─── GET /api/wishlist ───────────────────────────────────────────────────

    test "show: returns wishlist for authenticated user" do
      user = users(:regular_user)
      get api_wishlist_url, headers: auth_headers(user)

      assert_response :ok
      json = JSON.parse(response.body)
      assert_equal user.id, json["userId"]
      assert json.key?("items")
      assert json.key?("itemCount")
    end

    test "show: returns 401 without token" do
      get api_wishlist_url
      assert_response :unauthorized
    end

    test "show: creates wishlist automatically if user has none" do
      user = users(:admin_user)
      assert_nil user.wishlist

      get api_wishlist_url, headers: auth_headers(user)

      assert_response :ok
      assert_not_nil user.reload.wishlist
    end

    test "show: returns items already in wishlist" do
      user = users(:regular_user)
      get api_wishlist_url, headers: auth_headers(user)

      assert_response :ok
      json = JSON.parse(response.body)
      assert json["itemCount"] >= 1
    end

    # ─── POST /api/wishlist/items ────────────────────────────────────────────

    test "add_item: adds a product to the wishlist" do
      user = users(:admin_user)
      product = products(:valid_product)

      assert_difference("WishlistItem.count", 1) do
        post api_wishlist_items_url,
          params: { product_id: product.id },
          headers: auth_headers(user),
          as: :json
      end

      assert_response :ok
      json = JSON.parse(response.body)
      assert_equal "Product added to wishlist", json["message"]
      assert json.key?("wishlist")
    end

    test "add_item: returns 401 without token" do
      post api_wishlist_items_url, params: { product_id: products(:valid_product).id }, as: :json
      assert_response :unauthorized
    end

    test "add_item: returns 404 when product does not exist" do
      assert_no_difference("WishlistItem.count") do
        post api_wishlist_items_url,
          params: { product_id: "nonexistent" },
          headers: auth_headers(users(:regular_user)),
          as: :json
      end

      assert_response :not_found
      assert_match(/not found/i, JSON.parse(response.body)["error"])
    end

    test "add_item: returns 422 when product is already in wishlist" do
      user = users(:regular_user)

      assert_no_difference("WishlistItem.count") do
        post api_wishlist_items_url,
          params: { product_id: products(:valid_product).id },
          headers: auth_headers(user),
          as: :json
      end

      assert_response :unprocessable_entity
      assert_match(/already in wishlist/i, JSON.parse(response.body)["error"])
    end

    # ─── DELETE /api/wishlist/items/:id ─────────────────────────────────────

    test "remove_item: removes the item from the wishlist" do
      user = users(:regular_user)
      item = wishlist_items(:wishlist_item_one)

      assert_difference("WishlistItem.count", -1) do
        delete "/api/wishlist/items/#{item.id}", headers: auth_headers(user)
      end

      assert_response :ok
      assert_match(/removed/i, JSON.parse(response.body)["message"])
    end

    test "remove_item: returns 401 without token" do
      delete "/api/wishlist/items/#{wishlist_items(:wishlist_item_one).id}"
      assert_response :unauthorized
    end

    test "remove_item: returns 404 when item belongs to another user" do
      other_item = wishlist_items(:wishlist_item_one)

      assert_no_difference("WishlistItem.count") do
        delete "/api/wishlist/items/#{other_item.id}", headers: auth_headers(users(:admin_user))
      end

      assert_response :not_found
    end

    # ─── DELETE /api/wishlist ────────────────────────────────────────────────

    test "clear: removes all items from the wishlist" do
      user = users(:regular_user)

      delete api_wishlist_url, headers: auth_headers(user)

      assert_response :ok
      json = JSON.parse(response.body)
      assert_match(/cleared/i, json["message"])
      assert_equal 0, json["wishlist"]["itemCount"]
    end

    test "clear: returns 401 without token" do
      delete api_wishlist_url
      assert_response :unauthorized
    end
  end
end
