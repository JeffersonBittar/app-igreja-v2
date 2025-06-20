import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Modal,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { auth, db } from '../firebaseConfig';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  where,
  orderBy 
} from 'firebase/firestore';

const AgendaScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [userNote, setUserNote] = useState('');

  // Horários disponíveis para agendamento
  const timeSlots = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  useEffect(() => {
    loadBookedSlots();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      updateAvailableTimes();
    }
  }, [selectedDate, bookedSlots]);

  // Carregar agendamentos existentes
  const loadBookedSlots = async () => {
    try {
      const bookingsRef = collection(db, 'appointments');
      const snapshot = await getDocs(bookingsRef);
      const bookings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookedSlots(bookings);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    }
  };

  // Atualizar horários disponíveis
  const updateAvailableTimes = () => {
    const bookedTimesForDate = bookedSlots
      .filter(slot => slot.date === selectedDate)
      .map(slot => slot.time);
    
    const available = timeSlots.filter(time => !bookedTimesForDate.includes(time));
    setAvailableTimes(available);
  };

  // Selecionar data
  const onDayPress = (day) => {
    const today = new Date().toISOString().split('T')[0];
    if (day.dateString < today) {
      Alert.alert('Data inválida', 'Não é possível agendar para datas passadas.');
      return;
    }
    setSelectedDate(day.dateString);
  };

  // Selecionar horário
  const selectTime = (time) => {
    setSelectedTime(time);
    setShowTimeModal(true);
  };

  // Confirmar agendamento
  const confirmBooking = async () => {
    if (!userNote.trim()) {
      Alert.alert('Atenção', 'Por favor, adicione uma observação sobre o motivo do agendamento.');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Erro', 'Usuário não autenticado');
        return;
      }

      await addDoc(collection(db, 'appointments'), {
        date: selectedDate,
        time: selectedTime,
        userId: user.uid,
        userName: user.displayName || user.email,
        userEmail: user.email,
        note: userNote,
        status: 'agendado',
        createdAt: new Date().toISOString()
      });

      Alert.alert(
        'Agendamento Confirmado!', 
        `Seu agendamento para ${selectedDate} às ${selectedTime} foi confirmado.`
      );

      setShowTimeModal(false);
      setUserNote('');
      setSelectedTime('');
      loadBookedSlots();
    } catch (error) {
      console.error('Erro ao agendar:', error);
      Alert.alert('Erro', 'Não foi possível confirmar o agendamento.');
    }
  };

  // Renderizar horário disponível
  const renderTimeSlot = ({ item }) => (
    <TouchableOpacity
      style={styles.timeSlot}
      onPress={() => selectTime(item)}
    >
      <Text style={styles.timeText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agenda Pastoral</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Calendário */}
      <Calendar
        onDayPress={onDayPress}
        markedDates={{
          [selectedDate]: {
            selected: true,
            selectedColor: '#6366f1'
          }
        }}
        theme={{
          selectedDayBackgroundColor: '#6366f1',
          todayTextColor: '#6366f1',
          arrowColor: '#6366f1',
        }}
        minDate={new Date().toISOString().split('T')[0]}
      />

      {/* Horários Disponíveis */}
      {selectedDate && (
        <View style={styles.timeSlotsContainer}>
          <Text style={styles.sectionTitle}>
            Horários disponíveis para {selectedDate}
          </Text>
          {availableTimes.length > 0 ? (
            <FlatList
              data={availableTimes}
              renderItem={renderTimeSlot}
              keyExtractor={(item) => item}
              numColumns={4}
              contentContainerStyle={styles.timeSlotsList}
            />
          ) : (
            <Text style={styles.noTimesText}>
              Não há horários disponíveis para esta data.
            </Text>
          )}
        </View>
      )}

      {/* Modal de Confirmação */}
      <Modal
        visible={showTimeModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Agendamento</Text>
            <Text style={styles.modalText}>
              Data: {selectedDate}
            </Text>
            <Text style={styles.modalText}>
              Horário: {selectedTime}
            </Text>
            
            <TextInput
              style={styles.noteInput}
              placeholder="Motivo do agendamento..."
              value={userNote}
              onChangeText={setUserNote}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowTimeModal(false);
                  setUserNote('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmBooking}
              >
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  timeSlotsContainer: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  timeSlotsList: {
    paddingBottom: 20,
  },
  timeSlot: {
    flex: 1,
    backgroundColor: '#6366f1',
    margin: 5,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noTimesText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginVertical: 15,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  confirmButton: {
    backgroundColor: '#6366f1',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AgendaScreen;

