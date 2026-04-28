import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/Profile.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';

function Profile() {
  const { user, refreshUser } = useContext(AuthContext);
  const [name,     setName]     = useState(user?.name || '');
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp || '');
  const [photo,    setPhoto]    = useState(null);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');
  const [profilePhoto, setProfilePhoto] = useState(
    user?.profilePhoto &&
    user.profilePhoto !== '/assets/default-profile.png' &&
    user.profilePhoto !== ''
      ? `${API}/api/profile/photo/${user._id}`
      : '/assets/default-profile.png'
  );

  const flash = (ok, msg) => {
    if (ok) { setSuccess(msg); setError(''); } else { setError(msg); setSuccess(''); }
    setTimeout(() => { setSuccess(''); setError(''); }, 4000);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/api/profile`, { name, whatsapp },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      flash(true, 'Profile updated successfully');
      await refreshUser();
    } catch (err) {
      flash(false, err.response?.data?.msg || 'Update failed');
    }
  };

  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    if (!photo) return flash(false, 'Please select a photo');
    const formData = new FormData();
    formData.append('photo', photo);
    try {
      const res = await axios.post(`${API}/api/profile/photo`, formData,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setProfilePhoto(`${API}${res.data.profilePhoto}`);
      flash(true, 'Photo uploaded successfully');
      await refreshUser();
    } catch (err) {
      flash(false, err.response?.data?.msg || 'Photo upload failed');
    }
  };

  return (
    <div className="page">
      <Navbar />
      <main className="profile container">
        <header className="profile__head">
          <span className="eyebrow">Account</span>
          <h1 className="gradient-text">My Profile</h1>
          <p>Update your details and profile photo. Changes save instantly.</p>
        </header>

        {error   && <div className="profile__msg profile__msg--err">{error}</div>}
        {success && <div className="profile__msg profile__msg--ok">{success}</div>}

        <div className="profile__grid">
          <section className="profile__card">
            <div className="profile__avatar-wrap">
              <img src={profilePhoto} alt="Profile" className="profile__avatar" />
              <div className="profile__avatar-ring" aria-hidden="true" />
            </div>
            <h3>{user?.name || 'User'}</h3>
            <p className="profile__email">{user?.email}</p>

            <form onSubmit={handlePhotoUpload} className="profile__photo-form">
              <label className="profile__file">
                <input type="file" accept=".jpg, .jpeg, .png"
                  onChange={(e) => setPhoto(e.target.files[0])} />
                <span>{photo ? photo.name : 'Choose a new photo...'}</span>
              </label>
              <button type="submit" className="btn btn-ghost">Upload</button>
            </form>
          </section>

          <section className="profile__card profile__card--wide">
            <h3>Personal details</h3>
            <form onSubmit={handleUpdate} className="profile__form">
              <div className="field">
                <label>Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="field">
                <label>WhatsApp</label>
                <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
              </div>
              <div className="field">
                <label>Email</label>
                <input type="email" value={user?.email || ''} disabled />
              </div>
              <button type="submit" className="btn btn-primary">Save changes</button>
            </form>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Profile;
