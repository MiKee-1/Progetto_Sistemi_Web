require "test_helper"

class CartItemTest < ActiveSupport::TestCase
  def valid_item_attrs(overrides = {})
    {
      cart: carts(:empty_cart),
      product: products(:valid_product),
      quantity: 1,
      unit_price: 99.99
    }.merge(overrides)
  end

  test "is valid with correct attributes" do
    assert CartItem.new(valid_item_attrs).valid?
  end

  test "is invalid without quantity" do
    item = CartItem.new(valid_item_attrs(quantity: nil))
    assert_not item.valid?
    assert item.errors[:quantity].any?
  end

  test "is invalid with quantity zero" do
    item = CartItem.new(valid_item_attrs(quantity: 0))
    assert_not item.valid?
    assert item.errors[:quantity].any?
  end

  test "is invalid with negative quantity" do
    item = CartItem.new(valid_item_attrs(quantity: -1))
    assert_not item.valid?
    assert item.errors[:quantity].any?
  end

  test "is invalid with non-integer quantity" do
    item = CartItem.new(valid_item_attrs(quantity: 1.5))
    assert_not item.valid?
    assert item.errors[:quantity].any?
  end

  test "is invalid without unit_price" do
    item = CartItem.new(valid_item_attrs(unit_price: nil))
    assert_not item.valid?
    assert item.errors[:unit_price].any?
  end

  test "is invalid with unit_price zero" do
    item = CartItem.new(valid_item_attrs(unit_price: 0))
    assert_not item.valid?
    assert item.errors[:unit_price].any?
  end

  test "is invalid with negative unit_price" do
    item = CartItem.new(valid_item_attrs(unit_price: -5.00))
    assert_not item.valid?
    assert item.errors[:unit_price].any?
  end

  test "is invalid when same product is added twice to the same cart" do
    existing = cart_items(:item_one)
    duplicate = CartItem.new(
      cart: existing.cart,
      product: existing.product,
      quantity: 1,
      unit_price: 99.99
    )
    assert_not duplicate.valid?
    assert duplicate.errors[:product_id].any?
  end

  test "same product can exist in different carts" do
    other_cart = carts(:empty_cart)
    item = CartItem.new(
      cart: other_cart,
      product: products(:valid_product),
      quantity: 1,
      unit_price: 99.99
    )
    assert item.valid?
  end

  test "is invalid on create when product is out of stock" do
    other_cart = carts(:empty_cart)
    item = CartItem.new(
      cart: other_cart,
      product: products(:out_of_stock_product),
      quantity: 1,
      unit_price: 49.99
    )
    assert_not item.valid?
    assert item.errors[:product].any? { |e| e.match?(/out of stock/i) }
  end

  test "is invalid when quantity exceeds product stock" do
    other_cart = carts(:empty_cart)
    product = products(:valid_product) # quantity: 10
    item = CartItem.new(
      cart: other_cart,
      product: product,
      quantity: product.quantity + 1,
      unit_price: product.price
    )
    assert_not item.valid?
    assert item.errors[:quantity].any? { |e| e.match?(/exceeds available stock/i) }
  end

  test "is valid when quantity equals product stock" do
    other_cart = carts(:empty_cart)
    product = products(:valid_product) # quantity: 10
    item = CartItem.new(
      cart: other_cart,
      product: product,
      quantity: product.quantity,
      unit_price: product.price
    )
    assert item.valid?
  end

  test "as_json includes expected keys" do
    json = cart_items(:item_one).as_json
    %w[id cartId productId quantity unitPrice subtotal product].each do |key|
      assert_includes json.keys.map(&:to_s), key
    end
  end

  test "as_json subtotal equals quantity * unit_price" do
    item = cart_items(:item_one) # qty 2, price 99.99 → 199.98
    json = item.as_json
    assert_in_delta item.quantity * item.unit_price, json[:subtotal], 0.01
  end
end
