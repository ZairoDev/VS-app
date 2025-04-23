import { Ionicons, FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  SectionList,
  Alert,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Modalize } from 'react-native-modalize';
import { Checkbox } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

interface Traveller {
  id: string;
  name: string;
  age: string;
  gender: string;
  nationality: string;
  type: 'adult' | 'child' | 'infant';
  selected: boolean;
}

type AddTravellerParams = {
  id: string;
  adults: string;
  children: string;
  infants: string;
  existingTravellers?: string;
};

const AddTraveller = () => {
  const params = useLocalSearchParams<AddTravellerParams>();
  const modalizeRef = useRef<Modalize>(null);
  
  const maxAdults = parseInt(params.adults || '1');
  const maxChildren = parseInt(params.children || '0');
  const maxInfants = parseInt(params.infants || '0');
  
  const [travellers, setTravellers] = useState<Traveller[]>(
    params.existingTravellers ? JSON.parse(params.existingTravellers) : []
  );
  
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [nationality, setNationality] = useState('India');
  const [currentType, setCurrentType] = useState<'adult' | 'child' | 'infant'>('adult');
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  const remainingAdults = maxAdults - travellers.filter(t => t.type === 'adult').length;
  const remainingChildren = maxChildren - travellers.filter(t => t.type === 'child').length;
  const remainingInfants = maxInfants - travellers.filter(t => t.type === 'infant').length;

  const canAddAdult = remainingAdults > 0;
  const canAddChild = remainingChildren > 0;
  const canAddInfant = remainingInfants > 0;
  
  const openModal = () => {
    if (canAddAdult) setCurrentType('adult');
    else if (canAddChild) setCurrentType('child');
    else if (canAddInfant) setCurrentType('infant');
    modalizeRef.current?.open();
  };
  
  const validateTraveller = (): string | null => {
    if (!name.trim()) return 'Name is required';
    if (!age.trim()) return 'Age is required';
    
    const ageNum = parseInt(age);
    if (isNaN(ageNum)) return 'Age must be a number';
    
    if (currentType === 'adult' && ageNum < 13) {
      return 'Adults must be 13 or older';
    }
    
    if (currentType === 'child' && (ageNum < 2 || ageNum > 12)) {
      return 'Children must be between 2-12 years old';
    }
    
    if (currentType === 'infant' && ageNum >= 2) {
      return 'Infants must be under 2 years old';
    }
    
    return null;
  };
  
  const addTraveller = () => {
    const error = validateTraveller();
    if (error) {
      Alert.alert('Validation Error', error);
      return;
    }

    const newTraveller: Traveller = {
      id: Date.now().toString(),
      name: name.trim(),
      age: age.trim(),
      gender,
      nationality,
      type: currentType,
      selected: false,
    };
    
    setTravellers([...travellers, newTraveller]);
    modalizeRef.current?.close();
    resetForm();
    
    if (currentType === 'adult' && remainingAdults <= 1) {
      if (canAddChild) setCurrentType('child');
      else if (canAddInfant) setCurrentType('infant');
    } else if (currentType === 'child' && remainingChildren <= 1) {
      if (canAddInfant) setCurrentType('infant');
      else if (canAddAdult) setCurrentType('adult');
    }
  };

  const resetForm = () => {
    setName('');
    setAge('');
    setGender('Male');
    setNationality('India');
  };

  const toggleSelect = (id: string) => {
    setTravellers(travellers.map(traveller =>
      traveller.id === id ? { ...traveller, selected: !traveller.selected } : traveller
    ));
  };

  const handleSaveAndReturn = () => {
    console.log('Selected Travellers:', travellers.filter(t => t.selected));
    router.push({
      pathname: "/(screens)/reserve-page/[id]" ,
      params: {
        id: params.id,
        travellers: JSON.stringify(travellers)
      }
    });
  };

  const getRemainingSummary = () => {
    const parts = [];
    if (remainingAdults > 0) parts.push(`${remainingAdults} adult${remainingAdults !== 1 ? 's' : ''}`);
    if (remainingChildren > 0) parts.push(`${remainingChildren} child${remainingChildren !== 1 ? 'ren' : ''}`);
    if (remainingInfants > 0) parts.push(`${remainingInfants} infant${remainingInfants !== 1 ? 's' : ''}`);
    
    return parts.length > 0 ? `Remaining: ${parts.join(', ')}` : 'All travellers added';
  };

  const getTravellerTypeIcon = (type: string) => {
    switch(type) {
      case 'adult': return 'person';
      case 'child': return 'happy';
      case 'infant': return 'baby';
      default: return 'person';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Traveller</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${100 - ((remainingAdults + remainingChildren + remainingInfants) / 
                  (maxAdults + maxChildren + maxInfants) * 100)}%` 
              }
            ]} 
          />
        </View>
        <Text style={styles.remainingText}>{getRemainingSummary()}</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {travellers.length > 0 ? (
          <SectionList
            sections={[{ title: 'Saved Travellers', data: travellers }]}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.typeIconContainer}>
                    <Ionicons name={getTravellerTypeIcon(item.type )as any} size={16} color="#fff" />
                  </View>
                  <Text style={styles.travellerType}>
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </Text>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => {
                      setTravellers(travellers.filter(t => t.id !== item.id));
                    }}
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.cardRow}>
                  <Checkbox
                    status={item.selected ? 'checked' : 'unchecked'}
                    onPress={() => toggleSelect(item.id)}
                    color="orange"
                  />
                  <View style={styles.travellerInfoContainer}>
                    <Text style={styles.travellerName}>{item.name}</Text>
                    <View style={styles.travellerDetailsRow}>
                      <View style={styles.detailItem}>
                        <Ionicons name={item.gender === 'Male' ? 'male' : 'female'} size={14} color="#6B7280" />
                        <Text style={styles.travellerDetails}>{item.gender}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                        <Text style={styles.travellerDetails}>{item.age} yr</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Ionicons name="flag-outline" size={14} color="#6B7280" />
                        <Text style={styles.travellerDetails}>{item.nationality}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}
            ListFooterComponent={
              (canAddAdult || canAddChild || canAddInfant) ? (
                <TouchableOpacity onPress={openModal} style={styles.addButton}>
                  <View style={styles.addIconContainer}>
                    <Ionicons name="add" size={20} color="#fff" />
                  </View>
                  <Text style={styles.addButtonText}>Add New Traveller</Text>
                </TouchableOpacity>
              ) : null
            }
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people" size={60} color="#E5E7EB" />
            <Text style={styles.emptyStateTitle}>No travellers added yet</Text>
            <Text style={styles.emptyStateText}>Add travellers to continue with your booking</Text>
            {(canAddAdult || canAddChild || canAddInfant) && (
              <TouchableOpacity onPress={openModal} style={styles.emptyStateButton}>
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.emptyStateButtonText}>Add Traveller</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Save Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            travellers.filter(t => t.selected).length === 0 && styles.saveButtonDisabled
          ]}
          onPress={handleSaveAndReturn}
          disabled={travellers.filter(t => t.selected).length === 0}
        >
          <Text style={styles.saveButtonText}>
            {travellers.filter(t => t.selected).length > 0 
              ? `Save ${travellers.filter(t => t.selected).length} Traveller${travellers.filter(t => t.selected).length !== 1 ? 's' : ''}` 
              : 'Select Travellers'}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>


      <Modalize
        ref={modalizeRef}
        adjustToContentHeight
        modalStyle={styles.modalContent}
        handleStyle={styles.modalHandle}
        handlePosition="inside"
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add Traveller Details</Text>
          
          <View style={styles.typeContainer}>
            <Text style={styles.label}>Traveller Type</Text>
            <TouchableOpacity
              style={styles.typeSelector}
              onPress={() => setShowTypeSelector(!showTypeSelector)}
            >
              <View style={styles.typeSelectorInner}>
                <View style={[styles.typeIconContainer, styles.typeIconSmall]}>
                  <Ionicons name={getTravellerTypeIcon(currentType) as any} size={14} color="#fff" />
                </View>
                <Text style={styles.typeSelectorText}>
                  {currentType.charAt(0).toUpperCase() + currentType.slice(1)}
                </Text>
              </View>
              <Ionicons
                name={showTypeSelector ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="orange"
              />
            </TouchableOpacity>
            
            {showTypeSelector && (
              <View style={styles.typeOptions}>
                {canAddAdult && (
                  <TouchableOpacity
                    style={styles.typeOption}
                    onPress={() => {
                      setCurrentType('adult');
                      setShowTypeSelector(false);
                    }}
                  >
                    <View style={styles.typeOptionInner}>
                      <View style={[styles.typeIconContainer, styles.typeIconSmall]}>
                        <Ionicons name="person" size={14} color="#fff" />
                      </View>
                      <Text style={styles.typeOptionText}>Adult</Text>
                    </View>
                    <Text style={styles.typeOptionRemaining}>
                      {remainingAdults} remaining
                    </Text>
                  </TouchableOpacity>
                )}
                {canAddChild && (
                  <TouchableOpacity
                    style={styles.typeOption}
                    onPress={() => {
                      setCurrentType('child');
                      setShowTypeSelector(false);
                    }}
                  >
                    <View style={styles.typeOptionInner}>
                      <View style={[styles.typeIconContainer, styles.typeIconSmall]}>
                        <Ionicons name="happy" size={14} color="#fff" />
                      </View>
                      <Text style={styles.typeOptionText}>Child</Text>
                    </View>
                    <Text style={styles.typeOptionRemaining}>
                      {remainingChildren} remaining
                    </Text>
                  </TouchableOpacity>
                )}
                {canAddInfant && (
                  <TouchableOpacity
                    style={styles.typeOption}
                    onPress={() => {
                      setCurrentType('infant');
                      setShowTypeSelector(false);
                    }}
                  >
                    <View style={styles.typeOptionInner}>
                      <View style={[styles.typeIconContainer, styles.typeIconSmall]}>
                        <FontAwesome5 name="baby" size={14} color="#fff" />
                      </View>
                      <Text style={styles.typeOptionText}>Infant</Text>
                    </View>
                    <Text style={styles.typeOptionRemaining}>
                      {remainingInfants} remaining
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter full name"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Age</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="calendar-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter age"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.genderContainer}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderOptions}>
              {['Male', 'Female', 'Other'].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.genderButton,
                    gender === item && styles.genderButtonSelected,
                  ]}
                  onPress={() => setGender(item)}
                >
                  <Ionicons 
                    name={item === 'Male' ? 'male' : item === 'Female' ? 'female' : 'person'} 
                    size={16} 
                    color={gender === item ? 'white' : '#374151'} 
                    style={styles.genderIcon}
                  />
                  <Text
                    style={[
                      styles.genderButtonText,
                      gender === item && styles.genderButtonTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nationality</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="flag-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter nationality"
                value={nationality}
                onChangeText={setNationality}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.addButtonModal}
            onPress={addTraveller}
          >
            <Text style={styles.addButtonModalText}>Add Traveller</Text>
          </TouchableOpacity>
        </View>
      </Modalize>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerRight: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'orange',
    borderRadius: 3,
  },
  remainingText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F3F4F6',
  },
  typeIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'orange',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  typeIconSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  travellerType: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
    flex: 1,
  },
  deleteButton: {
    padding: 4,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  travellerInfoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  travellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  travellerDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  travellerDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  addIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'orange',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'orange',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 5,
  },
  saveButton: {
    backgroundColor: 'orange',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  saveButtonDisabled: {
    backgroundColor: '#FBBF85',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginRight: 8,
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
  },
  modalContainer: {
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  typeContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  typeSelectorInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeSelectorText: {  
    fontSize: 16,
    color: '#1F2937',
  },
  typeOptions: {
    marginTop: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  typeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  typeOptionInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeOptionText: {
    fontSize: 16,
    color: '#1F2937',
  },
  typeOptionRemaining: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  genderContainer: {
    marginBottom: 20,
  },
  genderOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
    backgroundColor: 'white',
  },
  genderIcon: {
    marginRight: 6,
  },
  genderButtonSelected: {
    backgroundColor: 'orange',
    borderColor: 'orange',
  },
  genderButtonText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  genderButtonTextSelected: {
    color: 'white',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  addButtonModal: {
    backgroundColor: 'orange',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  addButtonModalText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'orange',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
});

export default AddTraveller;