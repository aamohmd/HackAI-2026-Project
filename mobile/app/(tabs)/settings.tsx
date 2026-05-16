import React, { useContext } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styled } from 'nativewind';
import { SignOut, User as UserIcon, ShieldCheck, Info, CaretRight } from 'phosphor-react-native';
import { AuthContext } from '@/context/AuthContext';

const StyledScrollView = styled(ScrollView);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const auth = useContext(AuthContext);

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out from the Mizan system?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive", 
          onPress: () => auth?.logout() 
        }
      ]
    );
  };

  const SettingItem = ({ icon: Icon, title, value, onPress, destructive }: any) => (
    <StyledTouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-center p-5 bg-white/40 border-b-2 border-midnight/5 ${destructive ? 'active:bg-wax/10' : ''}`}
    >
      <StyledView className={`w-10 h-10 rounded-full items-center justify-center ${destructive ? 'bg-wax/10' : 'bg-midnight/5'}`}>
        <Icon size={20} color={destructive ? '#9A3412' : '#1E293B'} weight="duotone" />
      </StyledView>
      
      <StyledView className="flex-1 ml-4">
        <StyledText className={`text-sm font-bold uppercase tracking-[1] font-sans ${destructive ? 'text-wax' : 'text-midnight/60'}`}>
          {title}
        </StyledText>
        {value && (
          <StyledText className="text-midnight font-serif text-lg mt-0.5">
            {value}
          </StyledText>
        )}
      </StyledView>
      
      {!destructive && <CaretRight size={20} color="#1E293B30" />}
    </StyledTouchableOpacity>
  );

  return (
    <StyledView className="flex-1 bg-parchment-100">
      <StyledScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: 32,
        }}
      >
        <StyledView className="px-5 mb-8">
          <StyledText className="text-3xl font-bold text-midnight uppercase tracking-[2] font-serif">
            Settings
          </StyledText>
          <StyledText className="text-midnight/50 font-sans text-sm mt-1 uppercase tracking-[1]">
            System Configuration & Profile
          </StyledText>
        </StyledView>

        <StyledView className="mb-8">
          <StyledText className="px-5 text-[11px] font-bold text-midnight/30 uppercase tracking-[2] mb-3 font-sans">
            User Profile
          </StyledText>
          <SettingItem 
            icon={UserIcon} 
            title="Registered Phone" 
            value={auth?.user?.phone_number || "Not Available"} 
          />
          <SettingItem 
            icon={ShieldCheck} 
            title="Verification Status" 
            value="Verified Citizen" 
          />
        </StyledView>

        <StyledView className="mb-8">
          <StyledText className="px-5 text-[11px] font-bold text-midnight/30 uppercase tracking-[2] mb-3 font-sans">
            Legal Disclaimer
          </StyledText>
          <StyledView className="mx-5 p-5 bg-white/40 border-2 border-midnight/10 rounded-sm">
            <StyledText className="text-midnight/60 text-xs font-serif italic leading-relaxed">
              "Mizan is an AI-assisted legal aid system. The information provided is for educational purposes and does not constitute formal legal advice. Please consult with a registered attorney for sensitive legal matters."
            </StyledText>
          </StyledView>
        </StyledView>

        <StyledView className="mb-8">
          <StyledText className="px-5 text-[11px] font-bold text-midnight/30 uppercase tracking-[2] mb-3 font-sans">
            About System
          </StyledText>
          <SettingItem 
            icon={Info} 
            title="Version" 
            value="Mizan v1.0.4 - Production" 
          />
        </StyledView>

        <StyledView className="mt-4">
          <SettingItem 
            icon={SignOut} 
            title="Logout Session" 
            onPress={handleLogout}
            destructive
          />
        </StyledView>

        <StyledView className="items-center mt-12 opacity-20">
           <StyledText className="text-midnight font-serif italic">
             Justice is the scale of the world.
           </StyledText>
           <StyledText className="text-[10px] mt-2 font-sans uppercase tracking-[2]">
             HackAI 2026 - Moroccan Legal Tech
           </StyledText>
        </StyledView>
      </StyledScrollView>
    </StyledView>
  );
}
