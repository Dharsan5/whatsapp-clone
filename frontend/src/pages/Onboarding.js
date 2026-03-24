import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FiUser, FiInfo, FiCamera, FiArrowRight } from "react-icons/fi";
import DefaultAvatar from "../components/DefaultAvatar";
import "./Auth.css";

const Onboarding = () => {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [about, setAbout] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("about", about);
      if (avatar) formData.append("avatar", avatar);

      await updateProfile(formData);
      navigate("/chat");
    } catch (err) {
      setError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page onboarding-bg">
      <div className="onboarding-container">
        <div className="onboarding-header">
          <h1>Profile Info</h1>
          <p>Please provide your name and an optional profile photo</p>
        </div>

        <form className="onboarding-form" onSubmit={handleSubmit}>
          <div className="avatar-selection" onClick={() => fileInputRef.current.click()}>
            {avatarPreview ? (
              <img src={avatarPreview} alt="Preview" className="avatar-preview-img" />
            ) : (
              <div className="avatar-placeholder">
                <DefaultAvatar name={user.username} size={150} />
                <div className="avatar-overlay">
                  <FiCamera size={30} />
                  <span>ADD PHOTO</span>
                </div>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          {error && <div className="auth-error-visible">{error}</div>}

          <div className="form-group">
            <label className="field-label">Full Name</label>
            <div className="input-with-icon">
              <FiUser className="field-icon" size={18} />
              <input
                type="text"
                placeholder="Type your name here"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="field-label">About</label>
            <div className="input-with-icon">
              <FiInfo className="field-icon" size={18} />
              <input
                type="text"
                placeholder="Hey there! I am using WhatsApp."
                value={about}
                onChange={(e) => setAbout(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="onboarding-btn" disabled={loading}>
            {loading ? "Saving..." : (
              <>
                <span>NEXT</span>
                <FiArrowRight size={20} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
