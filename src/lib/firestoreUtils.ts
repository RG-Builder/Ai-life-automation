import { auth } from '../firebase';
import { OperationType, FirestoreErrorInfo } from '../types';

export const handleFirestoreError = (error: any, operationType: OperationType, path: string | null): FirestoreErrorInfo => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL,
      })) || []
    },
    operationType,
    path
  };
  console.error('🔥 Firestore Error:', JSON.stringify(errInfo, null, 2));
  return errInfo;
};
