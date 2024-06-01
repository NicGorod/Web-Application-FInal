function deleteUser(username) {
    if (confirm(`Are you sure you want to delete user "${username}"?`)) {
      fetch(`/users/${username}`, {
        method: 'DELETE'
      })
      .then(response => {
        if (response.ok) {
          // Reload the page to reflect the changes
          location.reload();
        } else {
          console.error('Failed to delete user');
        }
      })
      .catch(error => console.error('Error deleting user:', error));
    }
  }

document.addEventListener('DOMContentLoaded', () => {
  fetch('/users')
    .then(response => response.json())
    .then(users => {
      displayUsers(users);
    })
    .catch(error => console.error('Error fetching users:', error));

    function displayUsers(users) {
      const userList = document.querySelector('table');
      users.forEach(user => {
        if (user.username === 'admin') {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.password}</td>
            <td></td>
          `;
          userList.appendChild(row);
        } else {
          // If the user is admin, just display the username and password without the delete button, so dont have to restart the server if accidentally clicked.
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.password}</td>
            <td><button class="delete-button" onclick="deleteUser('${user.username}')">Delete</button></td>
          `;
          userList.appendChild(row);
        }
      });
    }

});
