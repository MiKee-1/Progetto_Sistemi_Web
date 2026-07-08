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

  # ---------------------------------------------------------------------------
  # Property-based tests (Rantly): invece di esempi scelti a mano, verifichiamo
  # l'invariante su carrelli con contenuti casuali. Prezzi generati in centesimi
  # e convertiti in BigDecimal per evitare imprecisioni float (colonna :decimal).
  # ---------------------------------------------------------------------------

  test "total and item_count match the sums for any cart contents (PBT)" do
    property_of {
      array(range(1, 4)) { [ range(1, 5), range(1, 100_000) ] }
    }.check(15) do |items|
      user = User.create!(
        email: "pbt-cart-#{SecureRandom.hex(8)}@example.com",
        password: "password123",
        first_name: "Pbt",
        last_name: "Cart",
        role: "user"
      )
      cart = Cart.create!(user: user)

      items.each do |quantity, price_cents|
        unit_price = BigDecimal(price_cents) / 100
        product = Product.create!(
          id: "pbt-cart-#{SecureRandom.hex(8)}",
          title: "PBT Product",
          price: unit_price,
          original_price: unit_price,
          quantity: quantity
        )
        cart.cart_items.create!(product: product, quantity: quantity, unit_price: unit_price)
      end

      expected_total = items.sum { |quantity, price_cents| quantity * (BigDecimal(price_cents) / 100) }
      expected_count = items.sum { |quantity, _price_cents| quantity }

      assert_equal expected_total, cart.total,
        "total should be the sum of quantity * unit_price over #{items.inspect}"
      assert_equal expected_count, cart.item_count,
        "item_count should be the sum of quantities over #{items.inspect}"
    end
  end
end
