require "test_helper"

class OrderTest < ActiveSupport::TestCase
  def valid_order_attrs(overrides = {})
    {
      total: 99.99,
      customer: { "firstName" => "Mario", "lastName" => "Rossi", "email" => "mario@example.com" },
      address: { "street" => "Via Roma 1", "city" => "Milano", "zip" => "20100" }
    }.merge(overrides)
  end

  test "is valid with all required attributes" do
    assert Order.new(valid_order_attrs).valid?
  end

  test "is valid without a user (guest order)" do
    order = Order.new(valid_order_attrs)
    assert_nil order.user
    assert order.valid?
  end

  test "is invalid without total" do
    order = Order.new(valid_order_attrs(total: nil))
    assert_not order.valid?
    assert order.errors[:total].any?
  end

  test "is invalid with total zero" do
    order = Order.new(valid_order_attrs(total: 0))
    assert_not order.valid?
    assert order.errors[:total].any?
  end

  test "is invalid with negative total" do
    order = Order.new(valid_order_attrs(total: -10))
    assert_not order.valid?
    assert order.errors[:total].any?
  end

  test "is invalid without customer" do
    order = Order.new(valid_order_attrs(customer: nil))
    assert_not order.valid?
    assert order.errors[:customer].any?
  end

  test "is invalid without address" do
    order = Order.new(valid_order_attrs(address: nil))
    assert_not order.valid?
    assert order.errors[:address].any?
  end

  test "is invalid when customer firstName exceeds 50 characters" do
    order = Order.new(valid_order_attrs(
      customer: { "firstName" => "A" * 51, "lastName" => "Rossi", "email" => "a@b.com" }
    ))
    assert_not order.valid?
    assert order.errors[:customer].any? { |e| e.match?(/firstName/i) }
  end

  test "is invalid when customer lastName exceeds 50 characters" do
    order = Order.new(valid_order_attrs(
      customer: { "firstName" => "Mario", "lastName" => "R" * 51, "email" => "a@b.com" }
    ))
    assert_not order.valid?
    assert order.errors[:customer].any? { |e| e.match?(/lastName/i) }
  end

  test "is invalid when customer email exceeds 255 characters" do
    order = Order.new(valid_order_attrs(
      customer: { "firstName" => "Mario", "lastName" => "Rossi", "email" => "#{'a' * 250}@b.com" }
    ))
    assert_not order.valid?
    assert order.errors[:customer].any? { |e| e.match?(/email/i) }
  end

  test "is valid when customer fields are within limits" do
    order = Order.new(valid_order_attrs(
      customer: { "firstName" => "A" * 50, "lastName" => "B" * 50, "email" => "ok@example.com" }
    ))
    assert order.valid?
  end

  test "is invalid when address street exceeds 255 characters" do
    order = Order.new(valid_order_attrs(
      address: { "street" => "V" * 256, "city" => "Milano", "zip" => "20100" }
    ))
    assert_not order.valid?
    assert order.errors[:address].any? { |e| e.match?(/street/i) }
  end

  test "is invalid when address city exceeds 100 characters" do
    order = Order.new(valid_order_attrs(
      address: { "street" => "Via Roma 1", "city" => "C" * 101, "zip" => "20100" }
    ))
    assert_not order.valid?
    assert order.errors[:address].any? { |e| e.match?(/city/i) }
  end

  test "is invalid when address zip exceeds 10 characters" do
    order = Order.new(valid_order_attrs(
      address: { "street" => "Via Roma 1", "city" => "Milano", "zip" => "1" * 11 }
    ))
    assert_not order.valid?
    assert order.errors[:address].any? { |e| e.match?(/zip/i) }
  end

  test "is valid when address fields are within limits" do
    order = Order.new(valid_order_attrs(
      address: { "street" => "V" * 255, "city" => "C" * 100, "zip" => "1" * 10 }
    ))
    assert order.valid?
  end

  test "destroying order restores product quantities" do
    product = products(:valid_product)
    initial_qty = product.quantity

    order = Order.create!(valid_order_attrs)
    order.order_items.create!(
      product: product,
      quantity: 3,
      unit_price: product.price
    )

    order.destroy!

    assert_equal initial_qty + 3, product.reload.quantity
  end

  test "destroying order with multiple items restores all quantities" do
    p1 = products(:valid_product)
    p2 = products(:out_of_stock_product)
    p2.update!(quantity: 5)

    order = Order.create!(valid_order_attrs)
    order.order_items.create!(product: p1, quantity: 2, unit_price: p1.price)
    order.order_items.create!(product: p2, quantity: 5, unit_price: p2.price)

    qty1_before = p1.reload.quantity
    qty2_before = p2.reload.quantity

    order.destroy!

    assert_equal qty1_before + 2, p1.reload.quantity
    assert_equal qty2_before + 5, p2.reload.quantity
  end

  test "as_json includes expected keys" do
    json = orders(:order_with_user).as_json
    %w[id customer address total createdAt orderItems user].each do |key|
      assert_includes json.keys.map(&:to_s), key
    end
  end

  test "as_json excludes user key for guest orders" do
    json = orders(:order_without_user).as_json
    assert_not json.key?(:user)
  end

  test "as_json total matches stored value" do
    order = orders(:order_with_user)
    assert_in_delta order.total, order.as_json[:total], 0.01
  end
end
