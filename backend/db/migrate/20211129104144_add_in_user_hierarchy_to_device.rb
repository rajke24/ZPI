class AddInUserHierarchyToDevice < ActiveRecord::Migration[6.1]
  def change
    add_column :devices, :in_user_hierarchy_index, :bigint, null: false
  end
end
