require "test_helper"

class WishlistTest < ActiveSupport::TestCase
  test "fixture wishlist is valid" do
    assert wishlists(:user_wishlist).valid?
  end

  test "user_id is required" do
    wishlist = Wishlist.new
    assert_not wishlist.valid?
    assert wishlist.errors[:user_id].any?
  end

  test "a user can have only one wishlist" do
    duplicate = Wishlist.new(user_id: users(:regular_user).id)
    assert_not duplicate.valid?
    assert_includes duplicate.errors[:user_id], "has already been taken"
  end

  test "item_count returns the number of items" do
    assert_equal 1, wishlists(:user_wishlist).item_count
  end

  test "item_count is 0 for a new wishlist" do
    wishlist = Wishlist.create!(user_id: users(:admin_user).id)
    assert_equal 0, wishlist.item_count
  end

  test "empty? reflects the presence of items" do
    assert_not wishlists(:user_wishlist).empty?
    assert Wishlist.create!(user_id: users(:admin_user).id).empty?
  end

  test "clear_items destroys all wishlist items" do
    wishlist = wishlists(:user_wishlist)

    assert_difference "WishlistItem.count", -1 do
      wishlist.clear_items
    end
    assert wishlist.empty?
  end

  test "as_json exposes id, userId, items and itemCount" do
    json = wishlists(:user_wishlist).as_json
    assert_equal wishlists(:user_wishlist).id, json[:id]
    assert_equal users(:regular_user).id, json[:userId]
    assert_equal 1, json[:itemCount]
    assert_kind_of Array, json[:items]
    assert_equal 1, json[:items].size
  end

  test "destroying a wishlist destroys its items" do
    assert_difference "WishlistItem.count", -1 do
      wishlists(:user_wishlist).destroy
    end
  end
end
