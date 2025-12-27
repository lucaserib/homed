# Implementação do Sistema de Autenticação - Status

## ✅ COMPLETO - Backend

### 1. Schema do Banco de Dados
- ✅ Removidas tabelas: `RefreshToken`, `EmailVerification`, `PasswordReset`
- ✅ Removidos campos: `password`, `provider`, `providerId`, `emailVerified`, `emailVerifiedAt`
- ✅ Adicionado `approvalStatus` e `adminNotes` no model `User`
- ✅ IDs agora são Clerk IDs (não mais UUID)
- ✅ Migration aplicada com sucesso

### 2. Auth Service
- ✅ Removido completamente sistema JWT
- ✅ Criado `registerPatient()` usando Clerk ID
- ✅ Criado `registerDoctor()` usando Clerk ID
- ✅ Criado `getUserProfile()` que busca em ambas tabelas
- ✅ DTOs atualizados: `RegisterPatientDto`, `RegisterDoctorClerkDto`

### 3. Auth Controller
- ✅ Endpoint `POST /auth/register/patient`
- ✅ Endpoint `POST /auth/register/doctor`
- ✅ Endpoint `GET /auth/me`
- ✅ Removidos endpoints JWT obsoletos

### 4. Admin Module (NOVO)
- ✅ Criado `AdminService` com métodos de aprovação
- ✅ Criado `AdminController` com endpoints:
  - `GET /admin/pending/patients`
  - `GET /admin/pending/doctors`
  - `PUT /admin/approve/patient/:id`
  - `PUT /admin/approve/doctor/:id`
- ✅ DTO `ApprovalDto` para aprovar/rejeitar

### 5. Sync Controller
- ✅ Atualizado para retornar `approvalStatus` de pacientes e médicos

### 6. Email Service
- ✅ Adicionado `sendPatientRegistrationEmail()`
- ✅ Adicionado `sendPatientApprovalEmail()`
- ✅ Adicionado `sendPatientRejectionEmail()`
- ✅ Templates HTML já existentes para médicos mantidos

### 7. App Module
- ✅ `ClerkAuthGuard` aplicado globalmente
- ✅ `AdminModule` importado

---

## ⏳ PENDENTE - Frontend

### Arquivos que precisam ser atualizados:

#### 1. `/app/(auth)/sign-up.tsx` (Paciente)
**O que mudar:**
```typescript
// APÓS verificação do email, NÃO ativar sessão
const onVerifyPress = async () => {
  // ... verificação do código

  // Criar no banco
  await fetchAPI('/auth/register/patient', {
    method: 'POST',
    body: JSON.stringify({
      clerkId: createdUserId,
      name: form.name,
      email: form.email,
    }),
  });

  // NÃO chamar setActive() aqui
  // Apenas mostrar modal de sucesso
  setShowSuccessModal(true);
};

// No modal de sucesso, redirecionar para pending-approval
<CustomButton
  title="Aguardar Aprovação"
  onPress={() => router.replace('/(auth)/pending-approval')}
/>
```

#### 2. `/app/(auth)/doctor-sign-up.tsx` (Médico)
**O que mudar:**
```typescript
// Manter o mesmo fluxo de sign-up.tsx
// Endpoint já existe: POST /auth/register/doctor
// Não ativar sessão após verificação
// Redirecionar para pending-approval
```

#### 3. `/app/index.tsx` (Roteamento)
**O que mudar:**
```typescript
const checkUserStatus = async () => {
  const response = await fetchAPI('/sync/status');

  if (response?.exists) {
    // Verificar approvalStatus
    if (response.status === 'APPROVED') {
      // Redirecionar para dashboard correto
      if (response.role === 'doctor') {
        router.replace('/(doctor)/(tabs)/dashboard');
      } else {
        router.replace('/(root)/(tabs)/home');
      }
    } else if (response.status === 'PENDING') {
      // Fazer logout e redirecionar
      await signOut();
      router.replace('/(auth)/pending-approval');
    } else if (response.status === 'REJECTED') {
      // Mostrar mensagem de erro
      setErrorMessage('Seu cadastro foi rejeitado...');
    }
  }
};
```

#### 4. `/app/(auth)/pending-approval.tsx` (CRIAR NOVO)
**Criar arquivo:**
```typescript
import React from 'react';
import { View, Text, Image } from 'react-native';
import CustomButton from 'components/CustomButton';
import { router } from 'expo-router';

export default function PendingApproval() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-5">
      <Text className="mb-2 text-center font-JakartaBold text-2xl">
        Cadastro em Análise
      </Text>
      <Text className="mb-8 text-center font-Jakarta text-gray-600">
        Seu cadastro está sendo analisado pela nossa equipe.
        Você receberá um email quando for aprovado.
      </Text>
      <CustomButton
        title="Voltar para Login"
        onPress={() => router.replace('/(auth)/sign-in')}
      />
    </View>
  );
}
```

#### 5. `/app/(auth)/sign-in.tsx`
**O que verificar:**
- Login está usando Clerk
- Após login bem-sucedido, redirecionar para `/` (index.tsx vai gerenciar)
- Index.tsx verifica approvalStatus e redireciona corretamente

---

## 🧪 Como Testar

### Teste 1: Cadastro de Paciente
1. Abrir app → Ir para Sign Up
2. Preencher dados → Receber código no email
3. Digitar código → Cadastro criado no banco com status PENDING
4. Ver modal de sucesso → Clicar "Aguardar Aprovação"
5. Ser redirecionado para tela pending-approval

### Teste 2: Login com conta PENDING
1. Tentar fazer login
2. Sistema detecta status PENDING
3. Fazer logout automático
4. Redirecionar para pending-approval

### Teste 3: Aprovação Manual (Admin)
1. No banco ou via endpoint: `PUT /admin/approve/patient/:id`
2. Body: `{ "status": "APPROVED" }`
3. Paciente recebe email de aprovação

### Teste 4: Login após aprovação
1. Fazer login normalmente
2. Sistema detecta status APPROVED
3. Redirecionar para dashboard correto

---

## 📝 Notas Importantes

1. **Clerk apenas autentica**: Não armazena metadados de usuário
2. **Backend é fonte da verdade**: Todos os dados em PostgreSQL
3. **Aprovação manual**: Admin precisa aprovar cada cadastro
4. **Emails automáticos**: Enviados em cada etapa do fluxo
5. **Sem sessões órfãs**: Verificar antes de criar no banco

---

## 🔧 Próximos Passos Recomendados

1. Implementar painel admin para aprovar usuários
2. Adicionar webhook do Clerk para sincronizar deletações
3. Adicionar rate limiting nos endpoints públicos
4. Implementar logs de auditoria para aprovações
5. Criar testes automatizados E2E

---

## 📚 Documentação de Endpoints

### Auth Endpoints (Públicos)
- `POST /auth/register/patient` - Registrar paciente
- `POST /auth/register/doctor` - Registrar médico
- `GET /auth/me` - Perfil do usuário autenticado

### Admin Endpoints (Protegidos)
- `GET /admin/pending/patients` - Listar pacientes pendentes
- `GET /admin/pending/doctors` - Listar médicos pendentes
- `PUT /admin/approve/patient/:id` - Aprovar/Rejeitar paciente
- `PUT /admin/approve/doctor/:id` - Aprovar/Rejeitar médico

### Sync Endpoint (Protegido)
- `GET /sync/status` - Status de aprovação do usuário
