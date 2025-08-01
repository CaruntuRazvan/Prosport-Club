import React from 'react';
import { useConfirm } from '../../context/ConfirmContext';

const UserList = ({ users, onDeleteUser, onViewUser, onEditUser, currentUserId }) => {
  const showConfirm = useConfirm();

  return (
    <div className="user-list">
      {users.length > 0 ? (
        users.map((user) => (
          <div key={user._id} className="user-card">
            <div className="user-avatar">
              {user.name.split(' ').map(word => word.charAt(0).toUpperCase()).join('')}
            </div>
            <div className="user-info" onClick={() => onViewUser(user)}>
              <span className="user-name">{user.name}</span>
            </div>
            <button
              className="edit-btn"
              title="Edit"
              onClick={() => onEditUser(user)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-pencil"
                viewBox="0 0 16 16"
              >
                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
              </svg>
              <span className="edit-text">Edit</span>
            </button>
            {user._id !== currentUserId && ( // Hide delete button if user is the logged-in admin
              <button
                className="delete-btn"
                onClick={() => {
                  showConfirm(`Are you sure you want to delete the user ${user.name}?`, () => {
                    onDeleteUser(user.email);
                  });
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-trash"
                  viewBox="0 0 16 16"
                >
                  <path d="M5.5 5.5A.5.5 0 0 1 6 5h4a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5z"/>
                  <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"/>
                </svg>
              </button>
            )}
          </div>
        ))
      ) : (
        <p className="no-users">No users in the selected category.</p>
      )}
    </div>
  );
};

export default UserList;