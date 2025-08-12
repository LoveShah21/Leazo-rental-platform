"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Protected } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toaster";
import { API_BASE_URL } from "@/lib/api";
import Link from "next/link";
import {
  User,
  Mail,
  Shield,
  Edit3,
  Save,
  X,
  Check,
  Phone,
  Calendar,
  MapPin,
  Key,
  Bell,
  CreditCard,
  Package,
  Star,
  AlertCircle,
  CheckCircle2,
  ArrowLeft
} from "lucide-react";

// Fetch user profile
async function fetchUserProfile() {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      throw new Error('Authentication required');
    }
    throw new Error('Failed to fetch profile');
  }
  
  return response.json();
}

// Update user profile
async function updateUserProfile(userData: any) {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to update profile');
  }
  
  return response.json();
}

export default function CustomerProfilePage() {
  // Using token utilities directly now; user is derived from Protected/useSimpleAuth
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: ''
  });

  // Fetch user profile
  const { data: profileData, isLoading, error } = useQuery({
    queryKey: ['user-profile'],
    queryFn: fetchUserProfile,
    enabled: true,
    retry: (failureCount, error) => {
      if (error.message.includes('Authentication required')) {
        return false;
      }
      return failureCount < 3;
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      toast({
        title: "✅ Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const user = profileData?.data?.user;

  const handleEdit = () => {
    setEditData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      gender: user?.gender || ''
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    const updateData: any = {
      firstName: editData.firstName,
      lastName: editData.lastName,
    };

    if (editData.phone) updateData.phone = editData.phone;
    if (editData.dateOfBirth) updateData.dateOfBirth = editData.dateOfBirth;
    if (editData.gender) updateData.gender = editData.gender;

    updateProfileMutation.mutate(updateData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      firstName: '',
      lastName: '',
      phone: '',
      dateOfBirth: '',
      gender: ''
    });
  };

  if (isLoading) {
    return (
      <Protected roles={["customer"]}>
        <DashboardLayout>
          <div className="container mx-auto p-6">
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          </div>
        </DashboardLayout>
      </Protected>
    );
  }

  if (error) {
    return (
      <Protected roles={["customer"]}>
        <DashboardLayout>
          <div className="container mx-auto p-6">
            <Card className="border-destructive">
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Failed to Load Profile</h3>
                <p className="text-muted-foreground mb-4">{error.message}</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </Protected>
    );
  }

  return (
    <Protected roles={["customer"]}>
      <DashboardLayout>
        <div className="container mx-auto p-6 space-y-8">
          {/* Back Button */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard/customer">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <PageHeader
            title="Profile Settings"
            subtitle="Manage your account information and preferences"
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Overview */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                <CardContent className="p-6 text-center">
                  <div className="space-y-4">
                    {/* Avatar */}
                    <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>

                    {/* Basic Info */}
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {user?.firstName} {user?.lastName}
                      </h3>
                      <p className="text-muted-foreground">{user?.email}</p>
                      
                      {/* Role Badge */}
                      <Badge variant="secondary" className="mt-2">
                        <Shield className="h-3 w-3 mr-1" />
                        {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                      </Badge>
                    </div>

                    {/* Account Status */}
                    <div className="space-y-2 pt-4 border-t">
                      <div className="flex items-center justify-center gap-2">
                        {user?.isEmailVerified ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600 dark:text-green-400">Email Verified</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                            <span className="text-sm text-orange-600 dark:text-orange-400">Email Not Verified</span>
                          </>
                        )}
                      </div>
                      
                      {!user?.isEmailVerified && (
                        <Button variant="outline" size="sm" className="w-full">
                          Verify Email
                        </Button>
                      )}
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">0</div>
                        <div className="text-xs text-muted-foreground">Bookings</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">4.8</div>
                        <div className="text-xs text-muted-foreground">Rating</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                  </div>
                  {!isEditing ? (
                    <Button variant="outline" size="sm" onClick={handleEdit}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleCancel}
                        disabled={updateProfileMutation.isPending}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={handleSave}
                        disabled={updateProfileMutation.isPending}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      {isEditing ? (
                        <Input
                          id="firstName"
                          value={editData.firstName}
                          onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                          placeholder="Enter first name"
                        />
                      ) : (
                        <div className="h-10 px-3 py-2 border border-input rounded-md bg-muted/50 flex items-center">
                          {user?.firstName || 'Not provided'}
                        </div>
                      )}
                    </div>

                    {/* Last Name */}
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      {isEditing ? (
                        <Input
                          id="lastName"
                          value={editData.lastName}
                          onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                          placeholder="Enter last name"
                        />
                      ) : (
                        <div className="h-10 px-3 py-2 border border-input rounded-md bg-muted/50 flex items-center">
                          {user?.lastName || 'Not provided'}
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="h-10 px-3 py-2 border border-input rounded-md bg-muted/50 flex items-center justify-between">
                        <span>{user?.email}</span>
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {user?.isEmailVerified && <Check className="h-4 w-4 text-green-500" />}
                        </div>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={editData.phone}
                          onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                          placeholder="Enter phone number"
                        />
                      ) : (
                        <div className="h-10 px-3 py-2 border border-input rounded-md bg-muted/50 flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                          {user?.phone || 'Not provided'}
                        </div>
                      )}
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      {isEditing ? (
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={editData.dateOfBirth}
                          onChange={(e) => setEditData({ ...editData, dateOfBirth: e.target.value })}
                        />
                      ) : (
                        <div className="h-10 px-3 py-2 border border-input rounded-md bg-muted/50 flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}
                        </div>
                      )}
                    </div>

                    {/* Gender */}
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      {isEditing ? (
                        <select
                          id="gender"
                          value={editData.gender}
                          onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                          className="h-10 px-3 py-2 border border-input rounded-md bg-background"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer_not_to_say">Prefer not to say</option>
                        </select>
                      ) : (
                        <div className="h-10 px-3 py-2 border border-input rounded-md bg-muted/50 flex items-center">
                          <User className="h-4 w-4 mr-2 text-muted-foreground" />
                          {user?.gender ? user.gender.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'Not provided'}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Information */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>User ID</Label>
                      <div className="h-10 px-3 py-2 border border-input rounded-md bg-muted/50 flex items-center font-mono text-sm">
                        {user?.id}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Account Role</Label>
                      <div className="h-10 px-3 py-2 border border-input rounded-md bg-muted/50 flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                        {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Member Since</Label>
                      <div className="h-10 px-3 py-2 border border-input rounded-md bg-muted/50 flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Last Updated</Label>
                      <div className="h-10 px-3 py-2 border border-input rounded-md bg-muted/50 flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Unknown'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                      <Key className="h-5 w-5" />
                      <span className="text-xs">Change Password</span>
                    </Button>
                    
                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                      <Bell className="h-5 w-5" />
                      <span className="text-xs">Notifications</span>
                    </Button>
                    
                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                      <CreditCard className="h-5 w-5" />
                      <span className="text-xs">Payment Methods</span>
                    </Button>
                    
                    <Button variant="outline" className="h-20 flex flex-col gap-2">
                      <Package className="h-5 w-5" />
                      <span className="text-xs">Order History</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </Protected>
  );
}
