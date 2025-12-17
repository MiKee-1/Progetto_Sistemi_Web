class AddAuthenticationToUsers < ActiveRecord::Migration[8.1]
  def change
    # Rimuovi colonna name esistente
    remove_column :users, :name, :string

    # Aggiungi nuove colonne per autenticazione
    add_column :users, :first_name, :string, null: false
    add_column :users, :last_name, :string, null: false
    add_column :users, :address, :text
    add_column :users, :password_digest, :string, null: false
    add_column :users, :role, :string, default: 'user', null: false

    # Rendi email obbligatoria
    change_column_null :users, :email, false
    add_index :users, :email, unique: true
  end
end
