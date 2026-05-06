import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { AuthService } from '../auth/auth.service';
import { UserProfile } from '../models';
import { encryptText, decryptText } from '../utils/crypto';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);

  private profileDoc() {
    return doc(this.firestore, `users/${this.auth.uid}/profile/data`);
  }

  async saveProfile(profile: UserProfile & { fullSSN?: string }): Promise<void> {
    const uid = this.auth.uid!;
    const data: any = {
      name: profile.name,
      currentAddress: profile.currentAddress,
      previousAddresses: profile.previousAddresses,
      phone: profile.phone,
      dob: profile.dob,
      ssnLast4: profile.ssnLast4,
    };

    if (profile.fullSSN) {
      const { ciphertext, iv } = await encryptText(profile.fullSSN, uid);
      data.encryptedSSN = ciphertext;
      data.encryptionIV = iv;
    }

    await setDoc(this.profileDoc(), data, { merge: true });
  }

  async getProfile(): Promise<UserProfile | null> {
    const snap = await getDoc(this.profileDoc());
    return snap.exists() ? (snap.data() as UserProfile) : null;
  }

  async getDecryptedSSN(): Promise<string | null> {
    const profile = await this.getProfile();
    if (!profile?.encryptedSSN || !profile?.encryptionIV) return null;
    return decryptText(profile.encryptedSSN, profile.encryptionIV, this.auth.uid!);
  }
}
