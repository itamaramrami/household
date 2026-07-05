import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPage from './components/LoginPage';
import Home from './Pages/Home';
import SignUpPage from './components/SignUpPage';
import VerifyEmail from './components/VerifyEmail';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import AdminPage from './components/Admin';
import HomeMain from './Pages/HomeMain';
import AddFriend from './components/AddFriend';
import ProtectedRoute from './components/ProtectedRoute';
import ShoppingList from './components/ShoppingList';
import Dashboard from './components/Transaction/Dashboard';
import EventTable from './components/EventTable';
import TaskList from './components/TaskList';
import FriendRequests from './components/FriendRequests';
import { FinancialProvider } from './components/context/FinancialContext';
import { EventsProvider } from './components/context/EventsContext';
import { ShoppingProvider } from "./components/context/ShoppingContext";
import { AuthProvider } from './components/context/AuthContext';
import {SavingsProvider} from "./components/context/SavingsContext"
import {FixedPaymentsProvider} from "./components/context/FixedPaymentsContext"
import { TasksProvider } from "./components/context/TasksContext";
function App() {

  
 return (
  <AuthProvider> 
    <TasksProvider>
  <FinancialProvider>
    <ShoppingProvider>
    <SavingsProvider>
    <FixedPaymentsProvider>
    <EventsProvider>
   <ErrorBoundary>
     <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID!}>
       <Router>
         <Routes>
           <Route path="/" element={
             <ErrorBoundary>
               <HomeMain />
             </ErrorBoundary>
           } />
           
           <Route path="/login" element={
             <ErrorBoundary>
               <LoginPage />
             </ErrorBoundary>
           } />
           
           <Route path="/signUp" element={
             <ErrorBoundary>
               <SignUpPage />
             </ErrorBoundary>
           } />
           
           <Route path="/verify-email" element={
             <ErrorBoundary>
               <VerifyEmail />
             </ErrorBoundary>
           } />
           
           <Route path="/forgot-password" element={
             <ErrorBoundary>
               <ForgotPassword />
             </ErrorBoundary>
           } />
           
           <Route path="/reset-password/:token" element={
             <ErrorBoundary>
               <ResetPassword />
             </ErrorBoundary>
           } />
           
           <Route path="/add-friend" element={
             <ErrorBoundary>
               <AddFriend />
             </ErrorBoundary>
           } />
           
           <Route path="/Home" element={
             <ProtectedRoute>
               <ErrorBoundary>
                 <Home />
               </ErrorBoundary>
             </ProtectedRoute>
           } />
           
           <Route path="/admin" element={
             <ProtectedRoute>
               <ErrorBoundary>
                 <AdminPage />
               </ErrorBoundary>
             </ProtectedRoute>
           } />
           
           <Route path="/shopping-list" element={
             <ProtectedRoute>
               <ErrorBoundary>
                 <ShoppingList />
               </ErrorBoundary>
             </ProtectedRoute>
             
           } />
           
           <Route path="/tasks" element={
             <ProtectedRoute>
               <ErrorBoundary>
                 <TaskList />
               </ErrorBoundary>
             </ProtectedRoute>
           } />
           
           <Route path="/friend-requests" element={
             <ProtectedRoute>
               <ErrorBoundary>
                 <FriendRequests />
               </ErrorBoundary>
             </ProtectedRoute>
           } />
           
           <Route path="/dashboard" element={
             <ErrorBoundary>
               <Dashboard />
             </ErrorBoundary>
           } />
           
           <Route path="/events" element={
             <ProtectedRoute>
               <ErrorBoundary>
                 <EventTable />
               </ErrorBoundary>
             </ProtectedRoute>
           } />
         </Routes>
       </Router>
     </GoogleOAuthProvider>
   </ErrorBoundary>
   </EventsProvider>
   </FixedPaymentsProvider>

   </SavingsProvider>
   
   </ShoppingProvider>
   </FinancialProvider>
   </TasksProvider>
   </AuthProvider> 
 );

}

export default App;