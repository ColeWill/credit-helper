import { encryptText, decryptText } from './crypto';

describe('crypto utils', () => {
  const uid = 'test-user-123';
  const plaintext = '123456789';

  it('encrypts and decrypts round-trip correctly', async () => {
    const { ciphertext, iv } = await encryptText(plaintext, uid);
    const result = await decryptText(ciphertext, iv, uid);
    expect(result).toBe(plaintext);
  });

  it('ciphertext is not the same as plaintext', async () => {
    const { ciphertext } = await encryptText(plaintext, uid);
    expect(ciphertext).not.toBe(plaintext);
    expect(ciphertext).not.toContain(plaintext);
  });

  it('produces different ciphertext each call (random IV)', async () => {
    const a = await encryptText(plaintext, uid);
    const b = await encryptText(plaintext, uid);
    expect(a.ciphertext).not.toBe(b.ciphertext);
    expect(a.iv).not.toBe(b.iv);
  });

  it('fails to decrypt with wrong uid', async () => {
    const { ciphertext, iv } = await encryptText(plaintext, uid);
    await expectAsync(decryptText(ciphertext, iv, 'wrong-uid')).toBeRejected();
  });
});
