import React, { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function DebugAuth() {
  const [authState, setAuthState] = useState<any>(null);
  const [userDoc, setUserDoc] = useState<any>(null);
  const [token, setToken] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadDebugInfo();
  }, []);

  const loadDebugInfo = async () => {
    try {
      // Get current auth user
      const currentUser = auth.currentUser;
      setAuthState({
        uid: currentUser?.uid,
        email: currentUser?.email,
        emailVerified: currentUser?.emailVerified,
        metadata: currentUser?.metadata,
      });

      if (currentUser) {
        // Get ID token with claims
        const idTokenResult = await currentUser.getIdTokenResult();
        setToken({
          claims: idTokenResult.claims,
          authTime: idTokenResult.authTime,
          expirationTime: idTokenResult.expirationTime,
          issuedAtTime: idTokenResult.issuedAtTime,
        });

        // Get user document
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userSnapshot = await getDoc(userDocRef);
        if (userSnapshot.exists()) {
          setUserDoc({
            id: userSnapshot.id,
            data: userSnapshot.data(),
            exists: true,
          });
        } else {
          setUserDoc({ exists: false });
        }
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const refreshToken = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await currentUser.getIdToken(true);
        await loadDebugInfo();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug Info</h1>

      {error && (
        <Card className="mb-4 border-red-500">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm">{error}</pre>
          </CardContent>
        </Card>
      )}

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Auth State</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(authState, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>ID Token Claims</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(token, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>User Document</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(userDoc, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button onClick={loadDebugInfo}>Reload Debug Info</Button>
        <Button onClick={refreshToken}>Force Refresh Token</Button>
      </div>
    </div>
  );
}