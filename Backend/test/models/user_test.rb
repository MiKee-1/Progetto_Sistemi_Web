require "test_helper"

class UserTest < ActiveSupport::TestCase
  def build_user(attrs = {})
    User.new({
      email: "new.user@example.com",
      first_name: "Nuovo",
      last_name: "Utente",
      password: "password123",
      role: "user"
    }.merge(attrs))
  end

  # ─── Validazioni email ─────────────────────────────────────────────────────

  test "fixture user is valid" do
    assert users(:regular_user).valid?
  end

  test "email is required" do
    user = build_user(email: nil)
    assert_not user.valid?
    assert_includes user.errors[:email], "can't be blank"
  end

  test "email must be unique" do
    user = build_user(email: users(:regular_user).email)
    assert_not user.valid?
    assert_includes user.errors[:email], "has already been taken"
  end

  test "email must have a valid format" do
    user = build_user(email: "not-an-email")
    assert_not user.valid?
    assert user.errors[:email].any?
  end

  test "email cannot exceed 255 characters" do
    user = build_user(email: "#{'a' * 250}@example.com")
    assert_not user.valid?
  end

  # ─── Validazioni nome e ruolo ──────────────────────────────────────────────

  test "first_name is required" do
    user = build_user(first_name: nil)
    assert_not user.valid?
  end

  test "last_name is required" do
    user = build_user(last_name: nil)
    assert_not user.valid?
  end

  test "role must be user or admin" do
    user = build_user(role: "superuser")
    assert_not user.valid?
    assert build_user(role: "admin").valid?
  end

  # ─── Password (has_secure_password) ────────────────────────────────────────

  test "password must be at least 6 characters" do
    user = build_user(password: "12345")
    assert_not user.valid?
    assert user.errors[:password].any?
  end

  test "authenticate returns the user with the correct password" do
    user = users(:regular_user)
    assert_equal user, user.authenticate("password123")
  end

  test "authenticate returns false with a wrong password" do
    assert_not users(:regular_user).authenticate("wrong-password")
  end

  # ─── Metodi helper ─────────────────────────────────────────────────────────

  test "admin? is true only for admin role" do
    assert users(:admin_user).admin?
    assert_not users(:regular_user).admin?
  end

  test "full_name concatenates first and last name" do
    assert_equal "Mario Rossi", users(:regular_user).full_name
  end

  # ─── Serializzazione ───────────────────────────────────────────────────────

  test "as_json exposes camelCase keys and never the password digest" do
    json = users(:regular_user).as_json
    assert_equal "user@example.com", json[:email]
    assert_equal "Mario", json[:firstName]
    assert_equal "Rossi", json[:lastName]
    assert_equal "user", json[:role]
    assert_nil json[:password_digest]
    assert_nil json["password_digest"]
  end

  # ─── Associazioni ──────────────────────────────────────────────────────────

  test "destroying a user destroys its cart and wishlist but keeps orders" do
    user = users(:regular_user)
    order_ids = user.orders.pluck(:id)
    assert_not_empty order_ids

    assert_difference "Wishlist.count", -1 do
      user.destroy
    end

    order_ids.each do |id|
      assert_nil Order.find(id).user_id
    end
  end
end
