require "test_helper"

module Api
  class ProductsControllerTest < ActionDispatch::IntegrationTest
    # ─── GET /api/products ───────────────────────────────────────────────────

    test "index: returns paginated product list with metadata" do
      get api_products_url

      assert_response :ok
      json = JSON.parse(response.body)
      assert json.key?("products")
      assert json.key?("total")
      assert json.key?("page")
      assert json.key?("limit")
      assert_kind_of Array, json["products"]
      assert json["products"].length >= 1
    end

    test "index: title filter matches product title" do
      get api_products_url, params: { title: "Out of Stock" }

      assert_response :ok
      json = JSON.parse(response.body)
      titles = json["products"].map { |p| p["title"] }
      assert titles.all? { |t| t.downcase.include?("out of stock") }
    end

    test "index: title filter matches product description" do
      get api_products_url, params: { title: "no stock" }

      assert_response :ok
      json = JSON.parse(response.body)
      assert json["products"].any? { |p| p["title"] == "Out of Stock Product" }
    end

    test "index: min_price filter excludes cheaper products" do
      get api_products_url, params: { min_price: 90 }

      assert_response :ok
      json = JSON.parse(response.body)
      assert json["products"].all? { |p| p["price"] >= 90 }
      assert json["products"].none? { |p| p["title"] == "Out of Stock Product" }
    end

    test "index: max_price filter excludes more expensive products" do
      get api_products_url, params: { max_price: 60 }

      assert_response :ok
      json = JSON.parse(response.body)
      assert json["products"].all? { |p| p["price"] <= 60 }
      assert json["products"].none? { |p| p["title"] == "Test Product" }
    end

    test "index: combining min_price and max_price returns only matching products" do
      get api_products_url, params: { min_price: 40, max_price: 60 }

      assert_response :ok
      json = JSON.parse(response.body)
      assert json["products"].all? { |p| p["price"] >= 40 && p["price"] <= 60 }
    end

    test "index: sort price_asc returns cheaper product first" do
      get api_products_url, params: { sort: "price_asc" }

      assert_response :ok
      prices = JSON.parse(response.body)["products"].map { |p| p["price"] }
      assert_equal prices.sort, prices
    end

    test "index: sort price_desc returns more expensive product first" do
      get api_products_url, params: { sort: "price_desc" }

      assert_response :ok
      prices = JSON.parse(response.body)["products"].map { |p| p["price"] }
      assert_equal prices.sort.reverse, prices
    end

    test "index: default sort is date descending" do
      get api_products_url

      assert_response :ok
      dates = JSON.parse(response.body)["products"].map { |p| p["createdAt"] }
      assert_equal dates.sort.reverse, dates
    end

    # ─── GET /api/products/:id ───────────────────────────────────────────────

    test "show: returns product JSON for a valid id" do
      product = products(:valid_product)
      get api_product_url(product)

      assert_response :ok
      json = JSON.parse(response.body)
      assert_equal product.id.to_s, json["id"].to_s
      assert_equal product.title, json["title"]
    end

    test "show: returns 404 with error message for nonexistent id" do
      get api_product_url("nonexistent-id")

      assert_response :not_found
      json = JSON.parse(response.body)
      assert_match(/not found/i, json["error"])
    end
  end
end
