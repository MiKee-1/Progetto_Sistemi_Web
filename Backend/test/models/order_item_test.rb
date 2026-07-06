require "test_helper"

class OrderItemTest < ActiveSupport::TestCase
  def valid_item_attrs(overrides = {})
    {
      order: orders(:user_order_one),
      product: products(:valid_product),
      quantity: 1,
      unit_price: 99.99
    }.merge(overrides)
  end

  test "is valid with correct attributes" do
    assert OrderItem.new(valid_item_attrs).valid?
  end

  test "is invalid without quantity" do
    item = OrderItem.new(valid_item_attrs(quantity: nil))
    assert_not item.valid?
    assert item.errors[:quantity].any?
  end

  test "is invalid with quantity zero" do
    item = OrderItem.new(valid_item_attrs(quantity: 0))
    assert_not item.valid?
    assert item.errors[:quantity].any?
  end

  test "is invalid with negative quantity" do
    item = OrderItem.new(valid_item_attrs(quantity: -1))
    assert_not item.valid?
    assert item.errors[:quantity].any?
  end

  test "is invalid with non-integer quantity" do
    item = OrderItem.new(valid_item_attrs(quantity: 2.5))
    assert_not item.valid?
    assert item.errors[:quantity].any?
  end

  test "is invalid without unit_price" do
    item = OrderItem.new(valid_item_attrs(unit_price: nil))
    assert_not item.valid?
    assert item.errors[:unit_price].any?
  end

  test "is invalid with unit_price zero" do
    item = OrderItem.new(valid_item_attrs(unit_price: 0))
    assert_not item.valid?
    assert item.errors[:unit_price].any?
  end

  test "is invalid with negative unit_price" do
    item = OrderItem.new(valid_item_attrs(unit_price: -1.00))
    assert_not item.valid?
    assert item.errors[:unit_price].any?
  end

  test "is invalid when same product appears twice in the same order" do
    existing = order_items(:order_item_one)
    duplicate = OrderItem.new(
      order: existing.order,
      product: existing.product,
      quantity: 1,
      unit_price: 99.99
    )
    assert_not duplicate.valid?
    assert duplicate.errors[:product_id].any?
  end

  test "same product can appear in different orders" do
    item = OrderItem.new(valid_item_attrs(order: orders(:order_without_user)))
    assert item.valid?
  end

  test "as_json includes expected keys" do
    json = order_items(:order_item_one).as_json
    %w[id orderId productId quantity unitPrice createdAt updatedAt product].each do |key|
      assert_includes json.keys.map(&:to_s), key
    end
  end

  test "as_json embeds product details" do
    json = order_items(:order_item_one).as_json
    assert_not_nil json[:product]
    assert json[:product].key?(:title)
  end
end
