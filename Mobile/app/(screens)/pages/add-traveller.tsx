import { Ionicons, FontAwesome } from '@expo/vector-icons';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Modalize } from 'react-native-modalize';
import { Checkbox } from 'react-native-paper';

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
  
  // Parse route parameters
  const maxAdults = parseInt(params.adults || '1');
  const maxChildren = parseInt(params.children || '0');
  const maxInfants = parseInt(params.infants || '0');
  
  // Initialize travellers from existing data or empty array
  const [travellers, setTravellers] = useState<Traveller[]>(
    params.existingTravellers ? JSON.parse(params.existingTravellers) : []
  );

  // Form state
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [nationality, setNationality] = useState('India');
  const [currentType, setCurrentType] = useState<'adult' | 'child' | 'infant'>('adult');
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  // Calculate remaining slots
  const remainingAdults = maxAdults - travellers.filter(t => t.type === 'adult').length;
  const remainingChildren = maxChildren - travellers.filter(t => t.type === 'child').length;
  const remainingInfants = maxInfants - travellers.filter(t => t.type === 'infant').length;

  const canAddAdult = remainingAdults > 0;
  const canAddChild = remainingChildren > 0;
  const canAddInfant = remainingInfants > 0;

  // Open the add traveller modal
  const openModal = () => {
    // Set default type based on available slots
    if (canAddAdult) setCurrentType('adult');
    else if (canAddChild) setCurrentType('child');
    else if (canAddInfant) setCurrentType('infant');
    modalizeRef.current?.open();
  };

  // Validate traveller data
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

  // Add a new traveller
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
    
    // Auto-select the next available type
    if (currentType === 'adult' && remainingAdults <= 1) {
      if (canAddChild) setCurrentType('child');
      else if (canAddInfant) setCurrentType('infant');
    } else if (currentType === 'child' && remainingChildren <= 1) {
      if (canAddInfant) setCurrentType('infant');
      else if (canAddAdult) setCurrentType('adult');
    }
  };

  // Reset form fields
  const resetForm = () => {
    setName('');
    setAge('');
    setGender('Male');
    setNationality('India');
  };

  // Toggle traveller selection
  const toggleSelect = (id: string) => {
    setTravellers(travellers.map(traveller =>
      traveller.id === id ? { ...traveller, selected: !traveller.selected } : traveller
    ));
  };

  // Save and return to reservation page
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

  // Get summary of remaining slots
  const getRemainingSummary = () => {
    const parts = [];
    if (remainingAdults > 0) parts.push(`${remainingAdults} adult${remainingAdults !== 1 ? 's' : ''}`);
    if (remainingChildren > 0) parts.push(`${remainingChildren} child${remainingChildren !== 1 ? 'ren' : ''}`);
    if (remainingInfants > 0) parts.push(`${remainingInfants} infant${remainingInfants !== 1 ? 's' : ''}`);
    
    return parts.length > 0 ? `Remaining: ${parts.join(',')}`:'All travellers added';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Traveller</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.remainingText}>{getRemainingSummary()}</Text>
        
        <SectionList
          sections={[{ title: 'Saved Travellers', data: travellers }]}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <Checkbox
                  status={item.selected ? 'checked' : 'unchecked'}
                  onPress={() => toggleSelect(item.id)}
                  color="#4F46E5"
                />
                <View style={styles.travellerInfoContainer}>
                  <Text style={styles.travellerName}>{item.name}</Text>
                  <Text style={styles.travellerDetails}>
                    {item.gender} • {item.age} yr • {item.nationality}
                  </Text>
                  <Text style={styles.travellerType}>
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => {
                  setTravellers(travellers.filter(t => t.id !== item.id));
                }}>
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListFooterComponent={
            (canAddAdult || canAddChild || canAddInfant) ? (
              <TouchableOpacity onPress={openModal} style={styles.addButton}>
                <Ionicons name="add" size={24} color="#4F46E5" />
                <Text style={styles.addButtonText}>Add New Traveller</Text>
              </TouchableOpacity>
            ) : null
          }                                                                                                                                                                                                                                                                                                                             
          scrollEnabled={false}
        />
      </ScrollView>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSaveAndReturn}
      >
        <Text style={styles.saveButtonText}>Save Travellers</Text>
      </TouchableOpacity>

      <Modalize
        ref={modalizeRef}
        adjustToContentHeight
        modalStyle={styles.modalContent}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add Traveller Details</Text>
          
          {/* Traveller Type Selector */}
          <View style={styles.typeContainer}>
            <Text style={styles.label}>Traveller Type</Text>
            <TouchableOpacity
              style={styles.typeSelector}
              onPress={() => setShowTypeSelector(!showTypeSelector)}
            >
              <Text style={styles.typeSelectorText}>
                {currentType.charAt(0).toUpperCase() + currentType.slice(1)}
              </Text>
              <Ionicons
                name={showTypeSelector ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#4F46E5"
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
                    <Text style={styles.typeOptionText}>Adult</Text>
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
                    <Text style={styles.typeOptionText}>Child</Text>
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
                    <Text style={styles.typeOptionText}>Infant</Text>
                    <Text style={styles.typeOptionRemaining}>
                      {remainingInfants} remaining
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
          
          {/* Gender Selector */}
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
          
          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter full name"
              value={name}
              onChangeText={setName}
            />
          </View>
          
          {/* Age Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter age"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />
          </View>
          
          {/* Nationality Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nationality</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter nationality"
              value={nationality}
              onChangeText={setNationality}
            />
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
    color: '#111827',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  remainingText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  travellerInfoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  travellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  travellerDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  travellerType: {
    fontSize: 12,
    color: '#4F46E5',
    marginTop: 4,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
    marginLeft: 8,
  },
  saveButton: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalContainer: {
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 24,
  },
  typeContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  typeSelectorText: {
    fontSize: 16,
    color: '#111827',
  },
  typeOptions: {
    marginTop: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  typeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  typeOptionText: {
    fontSize: 16,
    color: '#111827',
  },
  typeOptionRemaining: {
    fontSize: 14,
    color: '#6B7280',
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
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
    backgroundColor: 'white',
  },
  genderButtonSelected: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  genderButtonText: {
    fontSize: 16,
    color: '#374151',
  },
  genderButtonTextSelected: {
    color: 'white',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 16,
  },
  addButtonModal: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
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
});

export default AddTraveller;