export default function UserAvatar({ user }) {
  const initial = (user.displayName || user.email).charAt(0).toUpperCase();
  return (
    <div className="user-avatar">
      <span>{initial}</span>
    </div>
  );
}
