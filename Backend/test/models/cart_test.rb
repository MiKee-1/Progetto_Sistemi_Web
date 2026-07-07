require "test_helper"

class CartTest < ActiveSupport::TestCase
  test "total sums quantity * unit_price for all items" do
    cart = carts(:user_cart)
    # item_one: 2 * 99.99 = 199.98, item_two: 1 * 49.99 = 49.99 → 249.97
    assert_in_delta 249.97, cart.total, 0.01
  end

  test "total returns 0 for an empty cart" do
    cart = carts(:empty_cart)
    assert_equal 0, cart.total
  end

  test "item_count sums all item quantities" do
    cart = carts(:user_cart)
    # item_one qty 2 + item_two qty 1 = 3
    assert_equal 3, cart.item_count
  end

  test "item_count returns 0 for empty cart" do
    assert_equal 0, carts(:empty_cart).item_count
  end

  test "empty? returns false when cart has items" do
    refute carts(:user_cart).empty?
  end

  test "empty? returns true when cart has no items" do
    assert carts(:empty_cart).empty?
  end

  test "clear_items destroys all cart items" do
    cart = carts(:user_cart)
    assert_not cart.empty?
    cart.clear_items
    assert cart.empty?
    assert_equal 0, cart.cart_items.count
  end

  test "as_json includes expected keys" do
    json = carts(:user_cart).as_json
    assert_includes json.keys.map(&:to_s), "id"
    assert_includes json.keys.map(&:to_s), "userId"
    assert_includes json.keys.map(&:to_s), "items"
    assert_includes json.keys.map(&:to_s), "total"
    assert_includes json.keys.map(&:to_s), "itemCount"
  end

  test "as_json total matches calculated total" do
    cart = carts(:user_cart)
    json = cart.as_json
    assert_in_delta cart.total, json[:total], 0.01
  end

  test "is invalid without a user_id" do
    cart = Cart.new
    assert_not cart.valid?
    assert_includes cart.errors[:user_id], "can't be blank"
  end

  test "is invalid with a duplicate user_id" do
    existing = carts(:user_cart)
    duplicate = Cart.new(user_id: existing.user_id)
    assert_not duplicate.valid?
    assert_includes duplicate.errors[:user_id], "has already been taken"
  end

  test "is valid with a unique user_id" do
    new_user = User.create!(
      email: "third@example.com",
      password: "password123",
      password_confirmation: "password123",
      first_name: "Third",
      last_name: "User",
      role: "user"
    )
    cart = Cart.new(user_id: new_user.id)
    assert cart.valid?
  end
end
