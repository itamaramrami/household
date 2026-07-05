// components/ProtectedRoute/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  user_id: string;
  role: string;
  exp: number;
}

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const decoded: DecodedToken = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);

    if (!decoded.exp || decoded.exp < currentTime) {
      return <Navigate to="/login" />;
    }

    return children;

  } catch (error) {
    return <Navigate to="/login" />;
  }
};

export default ProtectedRoute;