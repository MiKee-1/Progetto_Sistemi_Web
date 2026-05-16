class Wishlist < ApplicationRecord
  belongs_to :user
  has_many :wishlist_items, dependent: :destroy
  has_many :products, through: :wishlist_items

  validates :user_id, presence: true, uniqueness: true

  def item_count
    wishlist_items.count
  end

  def empty?
    wishlist_items.empty?
  end

  def clear_items
    wishlist_items.destroy_all
  end

  def as_json(options = {})
    {
      id: id,
      userId: user_id,
      items: wishlist_items.map(&:as_json),
      itemCount: item_count,
      createdAt: created_at.iso8601,
      updatedAt: updated_at.iso8601
    }
  end
end
