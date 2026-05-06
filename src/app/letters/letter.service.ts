import { Injectable, inject } from '@angular/core';
import {
  Firestore, collection, addDoc, Timestamp,
} from '@angular/fire/firestore';
import { AuthService } from '../auth/auth.service';
import { UserProfile, Dispute, Bureau } from '../models';

export type LetterType =
  | 'personal_info_update'
  | 'round1'
  | 'follow_up'
  | 'reinvestigation'
  | 'escalation';

function today(): string {
  return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function disputeLines(disputes: Dispute[]): string {
  return disputes.map(d =>
    `<li><strong>${d.accountName}</strong> — Account #${d.accountNumber} — ${d.type.replace(/_/g, ' ')}</li>`
  ).join('');
}

function bureauAddress(bureau: Bureau): string {
  const addresses: Record<Bureau, string> = {
    Experian: 'Experian<br>P.O. Box 4500<br>Allen, TX 75013',
    TransUnion: 'TransUnion LLC<br>Consumer Dispute Center<br>P.O. Box 2000<br>Chester, PA 19016',
    Equifax: 'Equifax Information Services LLC<br>P.O. Box 740256<br>Atlanta, GA 30374',
  };
  return addresses[bureau];
}

@Injectable({ providedIn: 'root' })
export class LetterService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);

  generatePersonalInfoUpdateLetter(profile: UserProfile, bureau: Bureau, ssn: string): string {
    return `
      <div class="letter">
        <p>${today()}</p>
        <p>${bureauAddress(bureau)}</p>
        <p>Re: Personal Information Update Request</p>
        <p>To Whom It May Concern,</p>
        <p>My name is <strong>${profile.name}</strong>. My current address is ${profile.currentAddress}.
        My date of birth is ${profile.dob} and my Social Security Number is ${ssn}.</p>
        <p>I am writing to demand the immediate deletion of all outdated, inaccurate, or unnecessary
        personal identifying information from my credit file, including:</p>
        <ul>
          <li>All previous addresses where I no longer receive mail</li>
          <li>All outdated or incorrect phone numbers</li>
          <li>All incorrect variations of my name</li>
          <li>All entries in the employer section</li>
          <li>Any unnecessary display of my full Social Security Number or Date of Birth</li>
        </ul>
        <p>My correct information is as follows:<br>
        Name: ${profile.name}<br>
        Current Address: ${profile.currentAddress}<br>
        Phone: ${profile.phone}</p>
        <p>Please update my file immediately and send written confirmation of these changes.</p>
        <p>Sincerely,<br>${profile.name}<br>${profile.currentAddress}</p>
      </div>`;
  }

  generateRound1Letter(profile: UserProfile, bureau: Bureau, disputes: Dispute[], ssn: string): string {
    return `
      <div class="letter">
        <p>${today()}</p>
        <p>${bureauAddress(bureau)}</p>
        <p>Re: Formal Dispute — Request for Verification Under FCRA Section 609(a)(1)(A)</p>
        <p>To Whom It May Concern,</p>
        <p>My name is <strong>${profile.name}</strong>, residing at ${profile.currentAddress}.
        SSN: ${ssn}. DOB: ${profile.dob}.</p>
        <p>Pursuant to the Fair Credit Reporting Act (FCRA) Section 609(a)(1)(A), I hereby demand
        physical verification of the original signed consumer contract for each of the following
        accounts currently appearing on my credit report:</p>
        <ul>${disputeLines(disputes)}</ul>
        <p>If you cannot provide physical verification of the original signed consumer contract for
        any of the above accounts, you are required by federal law to immediately delete those items
        from my credit report.</p>
        <p>Please complete your investigation within 30 days as required by the FCRA.</p>
        <p>Respectfully,<br>${profile.name}<br>${profile.currentAddress}</p>
        <p><em>Enclosures: Copy of Photo ID, Social Security Card, Utility Bill</em></p>
      </div>`;
  }

  generateFollowUpLetter(profile: UserProfile, bureau: Bureau, disputes: Dispute[], ssn: string): string {
    return `
      <div class="letter">
        <p>${today()}</p>
        <p>${bureauAddress(bureau)}</p>
        <p>Re: Failure to Respond — Dispute Follow-Up Notice</p>
        <p>To Whom It May Concern,</p>
        <p>My name is <strong>${profile.name}</strong>, SSN: ${ssn}.</p>
        <p>On a prior date, I submitted a formal dispute regarding the following accounts:</p>
        <ul>${disputeLines(disputes)}</ul>
        <p>More than 30 days have passed and I have not received a response. You are in violation
        of the Fair Credit Reporting Act, which requires completion of investigations within 30 days
        (15 U.S.C. § 1681i). I demand immediate deletion of the disputed items and written
        confirmation of compliance.</p>
        <p>Failure to comply will result in a formal complaint filed with the Federal Trade Commission.</p>
        <p>Respectfully,<br>${profile.name}<br>${profile.currentAddress}</p>
      </div>`;
  }

  generateReinvestigationLetter(profile: UserProfile, bureau: Bureau, disputes: Dispute[], ssn: string): string {
    return `
      <div class="letter">
        <p>${today()}</p>
        <p>${bureauAddress(bureau)}</p>
        <p>Re: Demand for Reinvestigation — Inaccurate Verification</p>
        <p>To Whom It May Concern,</p>
        <p>My name is <strong>${profile.name}</strong>, SSN: ${ssn}.</p>
        <p>I have been notified that the following items were "verified," however I dispute the
        accuracy of this verification:</p>
        <ul>${disputeLines(disputes)}</ul>
        <p>Pursuant to 15 U.S.C. § 1681i(a)(6)(B)(iii), I demand the name, address, and telephone
        number of each person contacted during the reinvestigation of these items.</p>
        <p>I also demand a description of the procedure used to determine the accuracy and
        completeness of the disputed information.</p>
        <p>Respectfully,<br>${profile.name}<br>${profile.currentAddress}</p>
      </div>`;
  }

  generateEscalationLetter(profile: UserProfile, bureau: Bureau, disputes: Dispute[], ssn: string): string {
    return `
      <div class="letter">
        <p>${today()}</p>
        <p>${bureauAddress(bureau)}</p>
        <p>Re: Notice of Intent to File Lawsuit — Continued Reporting of Inaccurate Information</p>
        <p>To Whom It May Concern,</p>
        <p>My name is <strong>${profile.name}</strong>, SSN: ${ssn}.</p>
        <p>Despite multiple formal disputes, you continue to report the following inaccurate
        information on my credit report:</p>
        <ul>${disputeLines(disputes)}</ul>
        <p>This constitutes a willful violation of the Fair Credit Reporting Act (15 U.S.C. § 1681n).
        You are hereby notified that I intend to file a lawsuit seeking actual damages, statutory
        damages of up to $1,000 per violation, punitive damages, and attorney's fees.</p>
        <p>I am also filing a formal complaint with the Federal Trade Commission and the Consumer
        Financial Protection Bureau.</p>
        <p>You have 15 days to remove the disputed items before I proceed with legal action.</p>
        <p>Respectfully,<br>${profile.name}<br>${profile.currentAddress}</p>
      </div>`;
  }

  async saveLetterMeta(type: LetterType, bureau: Bureau, disputeIds: string[]): Promise<void> {
    const col = collection(this.firestore, `users/${this.auth.uid}/letters`);
    await addDoc(col, { type, bureau, generatedAt: Timestamp.now(), disputeIds });
  }

  htmlToPlainText(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return (div.textContent ?? div.innerText ?? '').replace(/\n{3,}/g, '\n\n').trim();
  }
}
