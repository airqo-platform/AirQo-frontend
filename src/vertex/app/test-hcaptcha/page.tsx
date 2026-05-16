# hCaptcha Test Page

'use client';

import React, { useState } from 'react';
import { useHCaptcha } from '@/components/hcaptcha/HCaptchaProvider';
import { getHCaptchaConfig } from '@/lib/hcaptcha';

export default function HCaptchaTestPage() {
  const [token, setToken] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const { loaded, error } = useHCaptcha();
  const config = getHCaptchaConfig();

  const handleVerify = async (captchaToken: string) => {
    setVerificationStatus('verifying');
    setErrorMessage('');

    try {
      const response = await fetch('/api/hcaptcha/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: captchaToken }),
      });

      const result = await response.json();

      if (result.success) {
        setToken(captchaToken);
        setVerificationStatus('success');
      } else {
        setVerificationStatus('error');
        setErrorMessage(result.error || 'Verification failed');
      }
    } catch (err) {
      setVerificationStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Verification error');
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">hCaptcha Test Page</h1>
        
        <div className="mb-6 p-4 bg-blue-50 rounded border border-blue-200">
          <h2 className="font-semibold mb-2">Configuration Status</h2>
          <div className="space-y-1 text-sm">
            <p><strong>Loaded:</strong> {loaded ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Enabled:</strong> {config.enabled ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Site Key:</strong> {config.siteKey ? '✅ Configured' : '❌ Missing'}</p>
            <p><strong>Secret Key:</strong> {process.env.HCAPTCHA_SECRET_KEY ? '✅ Configured' : '❌ Missing'}</p>
            {error && <p className="text-red-600"><strong>Error:</strong> {error}</p>}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="font-semibold mb-2">Test Invisible hCaptcha</h2>
          <p className="text-sm text-gray-600 mb-4">
            Click the button below to test hCaptcha verification. Most of the time you won't see a challenge.
          </p>
          
          <button
            onClick={() => handleVerify('test-token')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={!loaded || !config.enabled}
          >
            Test hCaptcha
          </button>
        </div>

        {verificationStatus !== 'idle' && (
          <div className="mb-6 p-4 rounded border">
            <h2 className="font-semibold mb-2">Verification Result</h2>
            {verificationStatus === 'verifying' && (
              <p className="text-blue-600">Verifying...</p>
            )}
            {verificationStatus === 'success' && (
              <div className="text-green-600">
                <p>✅ Verification successful!</p>
                <p className="text-xs mt-2">Token: {token.substring(0, 50)}...</p>
              </div>
            )}
            {verificationStatus === 'error' && (
              <p className="text-red-600">❌ {errorMessage}</p>
            )}
          </div>
        )}

        <div className="mb-6">
          <h2 className="font-semibold mb-2">Manual Token Verification</h2>
          <p className="text-sm text-gray-600 mb-2">
            Manually verify a token:
          </p>
          <ManualVerification />
        </div>

        <div className="p-4 bg-gray-50 rounded border text-sm">
          <h2 className="font-semibold mb-2">Test Scenarios</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Normal click - should verify without challenge</li>
            <li>Rapid clicks - might trigger challenge</li>
            <li>Check network tab for API calls</li>
            <li>Verify token in server logs</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function ManualVerification() {
  const [token, setToken] = useState('');
  const [result, setResult] = useState('');

  const handleVerify = async () => {
    const response = await fetch('/api/hcaptcha/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const data = await response.json();
    setResult(JSON.stringify(data, null, 2));
  };

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Enter hCaptcha token"
        className="w-full px-3 py-2 border rounded"
      />
      <button
        onClick={handleVerify}
        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
      >
        Verify Token
      </button>
      {result && (
        <pre className="p-2 bg-gray-100 rounded text-xs overflow-auto">
          {result}
        </pre>
      )}
    </div>
  );
}
