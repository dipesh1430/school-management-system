import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, BookOpen, User, CalendarCheck, Users } from 'lucide-react-native';

import DashboardScreen from '../screens/DashboardScreen';
import HomeworkScreen from '../screens/HomeworkScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import PTMScreen from '../screens/PTMScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#f1f5f9',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={DashboardScreen} 
        options={{
          tabBarIcon: ({ color }) => <Home color={color} size={22} />,
        }}
      />
      <Tab.Screen 
        name="Homework" 
        component={HomeworkScreen} 
        options={{
          tabBarIcon: ({ color }) => <BookOpen color={color} size={22} />,
        }}
      />
      <Tab.Screen 
        name="Attendance" 
        component={AttendanceScreen} 
        options={{
          tabBarIcon: ({ color }) => <CalendarCheck color={color} size={22} />,
        }}
      />
      <Tab.Screen 
        name="Meetings" 
        component={PTMScreen} 
        options={{
          tabBarIcon: ({ color }) => <Users color={color} size={22} />,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color }) => <User color={color} size={22} />,
        }}
      />
    </Tab.Navigator>
  );
}
