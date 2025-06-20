import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Image,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Swiper from 'react-native-swiper';
import { auth, db } from '../firebaseConfig';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [banners, setBanners] = useState([]);
  const [isLive, setIsLive] = useState(false);
  const [userRole, setUserRole] = useState('user');
  const [activeTab, setActiveTab] = useState('HOME');

  useEffect(() => {
    loadBanners();
    checkUserRole();
    checkLiveStatus();
  }, []);

  // Carregar banners do Firestore
  const loadBanners = async () => {
    try {
      const bannersCollection = collection(db, 'banners');
      const bannersSnapshot = await getDocs(bannersCollection);
      const bannersData = bannersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBanners(bannersData);
    } catch (error) {
      console.error('Erro ao carregar banners:', error);
      // Banners de exemplo caso não consiga carregar do Firebase
      setBanners([
        {
          id: '1',
          title: 'Uma Igreja Viva!',
          imageUrl: 'https://via.placeholder.com/350x200/6366f1/ffffff?text=Uma+Igreja+Viva!'
        },
        {
          id: '2',
          title: 'Bem-vindos!',
          imageUrl: 'https://via.placeholder.com/350x200/8b5cf6/ffffff?text=Bem-vindos!'
        }
      ]);
    }
  };

  // Verificar role do usuário
  const checkUserRole = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role || 'user');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar role do usuário:', error);
    }
  };

  // Verificar status de transmissão ao vivo
  const checkLiveStatus = async () => {
    try {
      const liveDoc = await getDoc(doc(db, 'settings', 'live'));
      if (liveDoc.exists()) {
        setIsLive(liveDoc.data().isLive || false);
      }
    } catch (error) {
      console.error('Erro ao verificar status live:', error);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Navegar para seções
  const navigateToSection = (section) => {
    navigation.navigate(section);
  };

  // Abrir links externos
  const openExternalLink = (url) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'HOME' && styles.activeTab]}
            onPress={() => setActiveTab('HOME')}
          >
            <Text style={[styles.tabText, activeTab === 'HOME' && styles.activeTabText]}>
              HOME
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'NOVIDADES' && styles.activeTab]}
            onPress={() => setActiveTab('NOVIDADES')}
          >
            <Text style={[styles.tabText, activeTab === 'NOVIDADES' && styles.activeTabText]}>
              NOVIDADES
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIcon}>
            <Ionicons name="settings-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon} onPress={handleLogout}>
            <Ionicons name="person-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Banner Carousel */}
        <View style={styles.bannerContainer}>
          <Swiper
            style={styles.wrapper}
            height={200}
            autoplay={true}
            autoplayTimeout={5}
            showsPagination={true}
            paginationStyle={styles.pagination}
            dotStyle={styles.dot}
            activeDotStyle={styles.activeDot}
          >
            {banners.map((banner) => (
              <View key={banner.id} style={styles.slide}>
                <Image 
                  source={{ uri: banner.imageUrl }} 
                  style={styles.bannerImage}
                  resizeMode="cover"
                />
                <View style={styles.bannerOverlay}>
                  <Text style={styles.bannerTitle}>{banner.title}</Text>
                </View>
              </View>
            ))}
          </Swiper>
        </View>

        {/* Título */}
        <Text style={styles.appTitle}>Novo app da Céus Abertos Caju chegou</Text>

        {/* Botões de Navegação */}
        <View style={styles.buttonsContainer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.navButton, styles.pgsButton]}
              onPress={() => navigateToSection('Agenda')}
            >
              <Ionicons name="calendar-outline" size={30} color="#fff" />
              <Text style={styles.buttonText}>AGENDA</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.navButton, styles.eventosButton]}
              onPress={() => navigateToSection('Eventos')}
            >
              <Ionicons name="calendar" size={30} color="#fff" />
              <Text style={styles.buttonText}>EVENTOS</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.navButton, styles.cultosButton]}
              onPress={() => navigateToSection('Cultos')}
            >
              <Ionicons name="book-outline" size={30} color="#fff" />
              <Text style={styles.buttonText}>CULTOS</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.navButton, styles.cursosButton]}
              onPress={() => navigateToSection('Cursos')}
            >
              <Ionicons name="school-outline" size={30} color="#fff" />
              <Text style={styles.buttonText}>CURSOS</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Botão Admin (apenas para admins) */}
        {userRole === 'admin' && (
          <TouchableOpacity 
            style={styles.adminButton}
            onPress={() => navigation.navigate('AdminPanel')}
          >
            <Ionicons name="settings" size={20} color="#fff" />
            <Text style={styles.adminButtonText}>Painel de Controle</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.footerButton}
          onPress={() => openExternalLink('https://youtube.com/@ceusabertoscaju')}
        >
          <Ionicons name="logo-youtube" size={24} color="#333" />
          <Text style={styles.footerText}>Cultos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.footerButton}
          onPress={() => openExternalLink('https://open.spotify.com/user/ceusabertoscaju')}
        >
          <Ionicons name="musical-notes" size={24} color="#333" />
          <Text style={styles.footerText}>Adoração</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.footerButton}
          onPress={() => openExternalLink('https://instagram.com/ceusabertoscaju')}
        >
          <Ionicons name="logo-instagram" size={24} color="#333" />
          <Text style={styles.footerText}>@ceusabertoscaju</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.footerButton}>
          <View style={[styles.liveIndicator, isLive && styles.liveActive]}>
            <Ionicons name="radio" size={24} color={isLive ? "#fff" : "#333"} />
          </View>
          <Text style={[styles.footerText, isLive && styles.liveText]}>
            {isLive ? 'AO VIVO' : 'Live'}
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  tabContainer: {
    flexDirection: 'row',
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#f97316',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  activeTabText: {
    color: '#f97316',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  headerIcon: {
    marginLeft: 15,
  },
  content: {
    flex: 1,
  },
  bannerContainer: {
    height: 200,
    marginBottom: 20,
  },
  wrapper: {},
  slide: {
    flex: 1,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  pagination: {
    bottom: 10,
  },
  dot: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  buttonsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  navButton: {
    width: (width - 50) / 2,
    height: 100,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  pgsButton: {
    backgroundColor: '#ec4899',
  },
  eventosButton: {
    backgroundColor: '#22c55e',
  },
  cultosButton: {
    backgroundColor: '#f59e0b',
  },
  cursosButton: {
    backgroundColor: '#8b5cf6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  adminButton: {
    backgroundColor: '#1e40af',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 15,
    borderRadius: 10,
  },
  adminButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  footerButton: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  liveIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveActive: {
    backgroundColor: '#ef4444',
  },
  liveText: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
});

export default HomeScreen;

