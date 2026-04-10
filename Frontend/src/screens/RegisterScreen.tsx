import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function RegisterScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    if (!agree) {
      Alert.alert(
        'Thông báo',
        'Vui lòng đồng ý với điều khoản sử dụng và chính sách bảo mật'
      );
      return;
    }

    Alert.alert('Thành công', 'Đăng ký thành công!');
    router.push('/');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#050816" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.logoWrapper}>
            <View style={styles.logoBox}>
              <Ionicons name="chatbubble-ellipses-outline" size={30} color="#fff" />
            </View>
            <Text style={styles.brand}>StartupChat</Text>
            <Text style={styles.subtitle}>Tham gia cộng đồng khởi nghiệp</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Tạo tài khoản</Text>
            <Text style={styles.description}>
              Điền thông tin để bắt đầu hành trình khởi nghiệp
            </Text>

            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialButton}>
                <FontAwesome name="google" size={16} color="#fff" />
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButton}>
                <FontAwesome name="github" size={16} color="#fff" />
                <Text style={styles.socialText}>GitHub</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>HOẶC</Text>
              <View style={styles.dividerLine} />
            </View>

            <Text style={styles.label}>Họ và tên</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color="#8b8fa3" />
              <TextInput
                style={styles.input}
                placeholder="Nguyễn Văn A"
                placeholderTextColor="#6b7280"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color="#8b8fa3" />
              <TextInput
                style={styles.input}
                placeholder="name@company.com"
                placeholderTextColor="#6b7280"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color="#8b8fa3" />
              <TextInput
                style={styles.input}
                placeholder="Tạo mật khẩu"
                placeholderTextColor="#6b7280"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#8b8fa3"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Xác nhận mật khẩu</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color="#8b8fa3" />
              <TextInput
                style={styles.input}
                placeholder="Nhập lại mật khẩu"
                placeholderTextColor="#6b7280"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#8b8fa3"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setAgree(!agree)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, agree && styles.checkboxChecked]}>
                {agree && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>

              <Text style={styles.checkboxText}>
                Tôi đồng ý với{' '}
                <Text style={styles.linkText}>Điều khoản sử dụng</Text> và{' '}
                <Text style={styles.linkText}>Chính sách bảo mật</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
              <Text style={styles.registerButtonText}>Tạo tài khoản</Text>
            </TouchableOpacity>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => router.push('/')}>
                <Text style={styles.footerLink}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050816',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  container: {
    flex: 1,
    paddingHorizontal: 22,
    justifyContent: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#4F7CFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#4F7CFF',
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  brand: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#0d111c',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 8,
  },
  description: {
    color: '#8b8fa3',
    fontSize: 14,
    marginBottom: 20,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  socialButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#111523',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 14,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  dividerText: {
    color: '#7b8194',
    fontSize: 12,
    marginHorizontal: 10,
    fontWeight: '600',
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 2,
  },
  inputWrapper: {
    height: 50,
    borderRadius: 12,
    backgroundColor: '#111523',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    color: '#fff',
    marginLeft: 10,
    fontSize: 14,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
    marginBottom: 18,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    marginRight: 10,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111523',
  },
  checkboxChecked: {
    backgroundColor: '#4F7CFF',
    borderColor: '#4F7CFF',
  },
  checkboxText: {
    flex: 1,
    color: '#c3c7d4',
    fontSize: 13,
    lineHeight: 20,
  },
  linkText: {
    color: '#5b86ff',
    fontWeight: '600',
  },
  registerButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#4F7CFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F7CFF',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  footerText: {
    color: '#8b8fa3',
    fontSize: 14,
  },
  footerLink: {
    color: '#5b86ff',
    fontSize: 14,
    fontWeight: '700',
  },
});
