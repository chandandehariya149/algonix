import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import '../styles/Profile.css';
import { Link } from 'react-router-dom';

function Profile() {
  const { user, logout, refreshUser } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || '');
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp || '');
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(
    user?.profilePhoto &&
    user.profilePhoto !== '/assets/default-profile.png' &&
    user.profilePhoto !== ''
      ? `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/profile/photo/${user._id}`
      : '/assets/default-profile.png'
  );

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/profile`,
        { name, whatsapp },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setSuccess('Profile updated successfully');
      setError('');
      await refreshUser();
    } catch (err) {
      setError(err.response?.data?.msg || 'Update failed');
      setSuccess('');
    }
  };

  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    if (!photo) {
      setError('Please select a photo');
      return;
    }

    const formData = new FormData();
    formData.append('photo', photo);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/profile/photo`,
        formData,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setSuccess('Photo uploaded successfully');
      setError('');
      setProfilePhoto(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}${res.data.profilePhoto}`);
      await refreshUser();
    } catch (err) {
      setError(err.response?.data?.msg || 'Photo upload failed');
      setSuccess('');
    }
  };

  const toggleDropdown = (e) => {
    const dropdown = e.currentTarget.querySelector('.dropdown-content');
    dropdown.classList.toggle('show');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      const dropdowns = document.querySelectorAll('.dropdown-content');
      dropdowns.forEach(dropdown => {
        if (!dropdown.parentElement.contains(e.target)) {
          dropdown.classList.remove('show');
        }
      });
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="profile-container">
      <nav className="profile-nav">
        <div className="nav-content">
          <a href="/" className="logo">ALGONIX</a>
          <div className="nav-links">
            <a href="/">Home</a>
            <Link to="/sheet">Sheet</Link>
            {user ? (
              <div className="profile-dropdown" onClick={toggleDropdown}>
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="profile-photo"
                />
                <div className="dropdown-content">
                  <a href="/profile">My Profile</a>
                  <button onClick={logout}>Logout</button>
                </div>
              </div>
            ) : (
              <a href="/login">Login</a>
            )}
          </div>
        </div>
      </nav>
      <div className="profile-content">
        <h2>My Profile</h2>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <div className="profile-details">
          <img
            src={profilePhoto}
            alt="Profile"
            className="profile-photo-large"
          />
          <form onSubmit={handlePhotoUpload} className="photo-form">
            <input
              type="file"
              accept=".jpg, .jpeg, .png"
              onChange={(e) => setPhoto(e.target.files[0])}
            />
            <button type="submit">Upload Photo</button>
          </form>
          <form onSubmit={handleUpdate} className="details-form">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <label>WhatsApp</label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />
            <label>Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
            />
            <button type="submit">Update Profile</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
