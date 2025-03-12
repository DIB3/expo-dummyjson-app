import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

export default function Layout() {
    return (
        <Tabs
            screenOptions={{
                tabBarStyle: { backgroundColor: theme.colors.card },
                tabBarActiveTintColor: theme.colors.primary
            }}
        >
           
            <Tabs.Screen 
                name="index" 
                options={{ 
                    title: 'Home', 
                    tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
                    headerShown: false
                }} 
            />

            <Tabs.Screen 
                name="search" 
                options={{ 
                    title: 'Search', 
                    tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
                    headerShown: false
                }} 
            />

        
            <Tabs.Screen 
                name="cart" 
                options={{ 
                    title: 'Cart', 
                    tabBarIcon: ({ color, size }) => <Ionicons name="cart" size={size} color={color} />,
                    headerShown: false
                }} 
            />

        
            
            <Tabs.Screen 
                name="profile" 
                options={{ 
                    title: 'Profile', 
                    tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
                    headerShown: false
                }} 
            />

            <Tabs.Screen 
                name="product/[id]" 
                options={{ 
                  href: null ,headerShown: false
                  
              }} 
            />

        </Tabs>
    );
}
