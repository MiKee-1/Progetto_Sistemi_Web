require "test_helper"

class ProductTest < ActiveSupport::TestCase
  def valid_attrs(overrides = {})
    {
      title: "Valid Product",
      description: "A valid product",
      price: 99.99,
      original_price: 129.99,
      quantity: 5
    }.merge(overrides)
  end

  test "should be valid with valid attributes" do
    product = Product.new(
      title: "Valid Product",
      description: "A valid product",
      price: 99.99,
      original_price: 129.99,
      quantity: 5
    )
    assert product.valid?, "Product should be valid with all required attributes"
  end

  test "should not be valid with negative price" do
    product = Product.new(
      title: "Invalid Product",
      description: "Product with negative price",
      price: -10.0,
      original_price: 129.99,
      quantity: 5
    )
    assert_not product.valid?, "Product should not be valid with negative price"
    assert_includes product.errors[:price], "must be greater than 0"
  end

  test "is invalid without title" do
    product = Product.new(valid_attrs(title: nil))
    assert_not product.valid?
    assert product.errors[:title].any?
  end

  test "is invalid when title exceeds 200 characters" do
    product = Product.new(valid_attrs(title: "A" * 201))
    assert_not product.valid?
    assert product.errors[:title].any?
  end

  test "is valid when title is exactly 200 characters" do
    product = Product.new(valid_attrs(title: "A" * 200))
    assert product.valid?
  end

  test "is valid with a blank description" do
    assert Product.new(valid_attrs(description: "")).valid?
    assert Product.new(valid_attrs(description: nil)).valid?
  end

  test "is invalid when description exceeds 2000 characters" do
    product = Product.new(valid_attrs(description: "x" * 2001))
    assert_not product.valid?
    assert product.errors[:description].any?
  end

  test "is valid when description is exactly 2000 characters" do
    assert Product.new(valid_attrs(description: "x" * 2000)).valid?
  end

  test "is invalid without price" do
    product = Product.new(valid_attrs(price: nil))
    assert_not product.valid?
    assert product.errors[:price].any?
  end

  test "is invalid with price zero" do
    product = Product.new(valid_attrs(price: 0))
    assert_not product.valid?
    assert product.errors[:price].any?
  end

  test "is invalid without original_price" do
    product = Product.new(valid_attrs(original_price: nil))
    assert_not product.valid?
    assert product.errors[:original_price].any?
  end

  test "is invalid with original_price zero or negative" do
    assert_not Product.new(valid_attrs(original_price: 0)).valid?
    assert_not Product.new(valid_attrs(original_price: -5)).valid?
  end

  test "is invalid without quantity" do
    product = Product.new(valid_attrs(quantity: nil))
    assert_not product.valid?
    assert product.errors[:quantity].any?
  end

  test "is invalid with negative quantity" do
    product = Product.new(valid_attrs(quantity: -1))
    assert_not product.valid?
    assert product.errors[:quantity].any?
  end

  test "is invalid with non-integer quantity" do
    product = Product.new(valid_attrs(quantity: 1.5))
    assert_not product.valid?
    assert product.errors[:quantity].any?
  end

  test "is valid with quantity zero" do
    assert Product.new(valid_attrs(quantity: 0)).valid?
  end

  test "in_stock? returns true when quantity is greater than zero" do
    assert products(:valid_product).in_stock?
  end

  test "in_stock? returns false when quantity is zero" do
    refute products(:out_of_stock_product).in_stock?
  end

  test "out_of_stock? returns true when quantity is zero" do
    assert products(:out_of_stock_product).out_of_stock?
  end

  test "out_of_stock? returns false when quantity is greater than zero" do
    refute products(:valid_product).out_of_stock?
  end

  test "in_stock? and out_of_stock? are always opposite" do
    product = products(:valid_product)
    assert_not_equal product.in_stock?, product.out_of_stock?
  end

  test "as_json includes all expected camelCase keys" do
    json = products(:valid_product).as_json
    %w[id title description price originalPrice sale thumbnail tags quantity inStock createdAt].each do |key|
      assert_includes json.keys.map(&:to_s), key
    end
  end

  test "as_json inStock reflects in_stock?" do
    assert products(:valid_product).as_json[:inStock]
    refute products(:out_of_stock_product).as_json[:inStock]
  end

  test "as_json price and originalPrice are floats" do
    json = products(:valid_product).as_json
    assert_instance_of Float, json[:price]
    assert_instance_of Float, json[:originalPrice]
  end

  # ---------------------------------------------------------------------------
  # Property-based test (Rantly): la validazione di price deve riflettere il
  # confine dello zero per QUALSIASI valore, non solo per gli esempi fissi.
  # ---------------------------------------------------------------------------

  test "price validation always reflects the zero boundary (PBT)" do
    # price positivo → nessun errore su :price
    property_of {
      range(1, 1_000_000)
    }.check(50) do |cents|
      price = BigDecimal(cents) / 100
      product = Product.new(title: "PBT", price: price, original_price: 10, quantity: 1)
      product.valid?
      assert_empty product.errors[:price],
        "price=#{price.to_s('F')} should not produce errors on :price"
    end

    # price nullo o negativo → sempre invalido con il messaggio atteso
    property_of {
      range(-1_000_000, 0)
    }.check(50) do |cents|
      price = BigDecimal(cents) / 100
      product = Product.new(title: "PBT", price: price, original_price: 10, quantity: 1)
      assert_not product.valid?, "price=#{price.to_s('F')} should be invalid"
      assert_includes product.errors[:price], "must be greater than 0"
    end
  end
end
