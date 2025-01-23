"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getCountries } from "@/utils/countries";
import { getTimezones } from "@/utils/timezones";
import { users } from "@/core/apis/users";
import { useAppSelector } from "@/core/redux/hooks";

export default function MyProfile() {
  const currentuser = useAppSelector((state) => state.user.userDetails);
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [countries, setCountries] = useState<{ value: string; label: string }[]>([]);
  const [timezones, setTimezones] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentuser) {
        const response = await users.getUserDetails(currentuser._id);
        const userData = response.users[0]; 
        setProfile({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          jobTitle: userData.jobTitle,
          country: userData.country,
          timezone: userData.timezone,
          bio: userData.description,
          profilePicture: userData.profilePicture,
        });
      }
    };
    fetchUserData();
  }, [currentuser]);

  useEffect(() => {
    setCountries(getCountries());
    setTimezones(getTimezones());
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setProfile({ ...profile, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updated profile:", profile);
    setIsEditing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, profilePicture: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Personal Information</h2>
      <p className="text-sm text-gray-500">Update your photo and personal details.</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex items-center space-x-4">
          <Avatar className="w-24 h-24">
            {profile?.profilePicture ? (
              <AvatarImage
                src={profile.profilePicture}
                alt={`${profile.firstName} ${profile.lastName}`}
              />
            ) : (
              <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                <span className="text-gray-500">No Image</span>
              </div>
            )}
          </Avatar>
          <div>
            <Button type="button" variant="outline" className="mb-2">
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                Update
              </Label>
            </Button>
            <Input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={isEditing}
            />
            <Button type="button" variant="outline" className="text-red-500">
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              name="firstName"
              value={profile.firstName || ""}
              onChange={handleInputChange}
              disabled={isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              name="lastName"
              value={profile.lastName || ""}
              onChange={handleInputChange}
              disabled={isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={profile.email || ""}
              onChange={handleInputChange}
              disabled={isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job title</Label>
            <Input
              id="jobTitle"
              name="jobTitle"
              value={profile.jobTitle || ""}
              onChange={handleInputChange}
              disabled={isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select value={profile.country} onValueChange={handleSelectChange("country")} disabled={isEditing}>
              <SelectTrigger>
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.value} value={country.value}>
                    {country.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={profile.timezone} onValueChange={handleSelectChange("timezone")} disabled={isEditing}>
              <SelectTrigger>
                <SelectValue placeholder="Select a timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((timezone) => (
                  <SelectItem key={timezone.value} value={timezone.value}>
                    {timezone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Bio</Label>
          <Textarea
            id="description"
            name="description"
            value={profile.bio || ""}
            onChange={handleInputChange}
            disabled={isEditing}
            rows={4}
          />
        </div>
          <Button type="submit">Save Changes</Button>
      </form>
    </div>
  );
}
