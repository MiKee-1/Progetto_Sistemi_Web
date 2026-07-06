require "test_helper"

class WishlistItemTest < ActiveSupport::TestCase
  test "fixture wishlist item is valid" do
    assert wishlist_items(:wishlist_item_one).valid?
  end

  test "the same product cannot appear twice in a wishlist" do
    duplicate = WishlistItem.new(
      wishlist_id: wishlists(:user_wishlist).id,
      product_id: products(:valid_product).id
    )
    assert_not duplicate.valid?
    assert_includes duplicate.errors[:product_id], "has already been taken"
  end

  test "the same product can appear in wishlists of different users" do
    other_wishlist = Wishlist.create!(user_id: users(:admin_user).id)
    item = WishlistItem.new(
      wishlist_id: other_wishlist.id,
      product_id: products(:valid_product).id
    )
    assert item.valid?
  end

  test "a wishlist can hold different products" do
    item = WishlistItem.new(
      wishlist_id: wishlists(:user_wishlist).id,
      product_id: products(:out_of_stock_product).id
    )
    assert item.valid?
  end

  test "belongs to its product and wishlist" do
    item = wishlist_items(:wishlist_item_one)
    assert_equal products(:valid_product), item.product
    assert_equal wishlists(:user_wishlist), item.wishlist
  end

  test "as_json exposes productId, wishlistId and the nested product" do
    json = wishlist_items(:wishlist_item_one).as_json
    assert_equal wishlist_items(:wishlist_item_one).id, json[:id]
    assert_equal wishlists(:user_wishlist).id, json[:wishlistId]
    assert_equal products(:valid_product).id, json[:productId]
    assert_equal "Test Product", json[:product][:title]
  end
end
