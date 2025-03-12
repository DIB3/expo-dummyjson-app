import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import styled from 'styled-components/native';
import { theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const Container = styled.View`
    flex: 1;
    background-color: ${theme.colors.background};
    padding: ${theme.spacing.large}px;
`;

const ProfileHeader = styled.View`
    align-items: center;
    margin-bottom: ${theme.spacing.xlarge}px;
`;

const ProfileImage = styled.Image`
    width: 120px;
    height: 120px;
    border-radius: 60px;
    margin-bottom: ${theme.spacing.small}px;
    border: 2px solid ${theme.colors.primary};
`;

const EditIcon = styled.TouchableOpacity`
    position: absolute;
    bottom: 5px;
    right: 5px;
    background-color: ${theme.colors.primary};
    padding: 6px;
    border-radius: 20px;
    elevation: 2;
`;

const InputSection = styled.View`
    margin-bottom: ${theme.spacing.medium}px;
`;

const Label = styled.Text`
    font-size: ${theme.fontSizes.medium}px;
    font-weight: bold;
    color: ${theme.colors.textSecondary};
    margin-bottom: 5px;
`;

const Input = styled.TextInput`
    background-color: ${theme.colors.card};
    padding: 12px;
    border-radius: ${theme.borderRadius}px;
    font-size: ${theme.fontSizes.medium}px;
    color: ${theme.colors.text};
    margin-bottom: ${theme.spacing.small}px;
`;

const Button = styled.TouchableOpacity`
    background-color: ${theme.colors.primary};
    padding: ${theme.spacing.medium}px;
    border-radius: ${theme.borderRadius}px;
    align-items: center;
    margin-top: ${theme.spacing.medium}px;
`;

const ButtonText = styled.Text`
    color: white;
    font-size: ${theme.fontSizes.medium}px;
    font-weight: bold;
`;

export default function ProfileScreen() {
   
    const [firstName, setfirstName] = useState('');
    const [lastName, setlastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [profileImage, setProfileImage] = useState('https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'); 
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(1); 


    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`https://dummyjson.com/users/${userId}`);
                const data = await response.json();

                if (data && data.id === userId) {
                    setfirstName(data.firstName);
                    setlastName (data.lastName); 
                    setEmail(data.email);
                    setPhone(data.phone);
                    setProfileImage(data.image || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'); 
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                Alert.alert('Error', 'Failed to load user data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId]);

    // Save changes and update user data on the server
    const saveChanges = async () => {
        if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
            return Alert.alert('Validation Error', 'All fields are required.');
        }

        try {
 
            const requestBody = {
                firstName, // Default to empty string if undefined
                lastName,
                email,
                phone,
                image: profileImage,
            };

            console.log('Request Body:', requestBody);

            const response = await fetch(`https://dummyjson.com/users/${userId}`, {
                method: 'PUT', // Use PUT or PATCH
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            console.log('Response Status:', response.status);
            console.log('Response OK:', response.ok);

            const result = await response.json();

            console.log('API Result:', result);

            if (response.ok && result && result.id === userId) {
                Alert.alert('Success', 'Your changes have been saved!');
            } else {
                Alert.alert('Error', 'Failed to save changes. Please try again.');
            }
        } catch (error) {
            console.error('Error saving user data:', error);
            Alert.alert('Error', 'An error occurred while saving your changes.');
        }
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <Container>
                {/* Loading Indicator */}
                {loading && (
                    <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
                        <Text>Loading...</Text>
                    </View>
                )}

                {/* Profile Header */}
                {!loading && (
                    <ProfileHeader>
                        <View>
                            <ProfileImage source={{ uri: profileImage }} />
                            <EditIcon onPress={() => Alert.alert('Edit Photo', 'Tap to change your profile photo')}>
                                <Ionicons name="camera" size={20} color="white" />
                            </EditIcon>
                        </View>
                        <Text style={{ fontSize: 22, fontWeight: 'bold', color: theme.colors.textPrimary }}>
                            {firstName || 'Your firstName'}
                        </Text>
                        <Text style={{ fontSize: 22, fontWeight: 'bold', color: theme.colors.textPrimary }}>
                            {lastName || 'Your lastName'}
                        </Text>
                        <Text style={{ fontSize: 16, color: theme.colors.textSecondary }}>
                            {email || 'No email provided'}
                        </Text>
                    </ProfileHeader>
                )}

                {/* Input Fields Section */}
                <InputSection>
                    <Label>First Name</Label>
                    <Input
                        value={firstName}
                        onChangeText={setfirstName}
                        placeholder="Enter your firstName"
                        keyboardType="default"
                    />
                </InputSection>

                <InputSection>
                    <Label>Last Name</Label>
                    <Input
                        value={lastName}
                        onChangeText={setlastName}
                        placeholder="Enter your lastName"
                        
                    />
                </InputSection>

                <InputSection>
                    <Label>Email Address</Label>
                    <Input
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter your email address"
                        keyboardType="email-address"
                    />
                </InputSection>

                <InputSection>
                    <Label>Phone Number</Label>
                    <Input
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="Enter your phone number"
                        keyboardType="phone-pad"
                    />
                </InputSection>

                {/* Save Button */}
                <Button onPress={saveChanges}>
                    <ButtonText>Save Changes</ButtonText>
                </Button>
            </Container>
        </ScrollView>
    );
}