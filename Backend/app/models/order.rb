class Order < ApplicationRecord
  belongs_to :user, optional: true
  has_many :order_items, dependent: :destroy
  has_many :products, through: :order_items

  validates :total, presence: true, numericality: { greater_than: 0 }
  validates :customer, presence: true
  validates :address, presence: true

  accepts_nested_attributes_for :order_items

  def as_json(options = {})
    base = {
      id: id,
      customer: customer,
      address: address,
      total: total.to_f,
      createdAt: created_at.iso8601,
      order_items: order_items.map(&:as_json)
    }

    # Aggiungi info utente se presente
    base[:user] = user.as_json if user.present?

    base
  end
end
