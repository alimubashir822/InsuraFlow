import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';
import { v4Polyfill as uuid } from '@/lib/uuid';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fileName, patientId, userName, userId } = body;

    // Simulate OCR processing delay (2 seconds)
    await delay(2000);

    // Pick details based on mock image filename or random choice
    const lowerName = fileName ? fileName.toLowerCase() : '';
    let provider = 'Blue Cross Blue Shield';
    let memberId = 'BCB' + Math.floor(100000000 + Math.random() * 900000000);
    let groupNumber = 'GRP' + Math.floor(10000 + Math.random() * 90000);
    let nameOnCard = 'John Smith';

    if (lowerName.includes('aetna')) {
      provider = 'Aetna Health';
      memberId = 'AET' + Math.floor(100000000 + Math.random() * 900000000);
      groupNumber = 'GRP' + Math.floor(20000 + Math.random() * 80000);
      nameOnCard = 'Mary Watson';
    } else if (lowerName.includes('cigna')) {
      provider = 'Cigna Dental';
      memberId = 'CIG' + Math.floor(100000000 + Math.random() * 900000000);
      groupNumber = 'GRP' + Math.floor(30000 + Math.random() * 70000);
      nameOnCard = 'Robert Downey';
    } else if (lowerName.includes('united') || lowerName.includes('uhc')) {
      provider = 'UnitedHealthcare';
      memberId = 'UHC' + Math.floor(100000000 + Math.random() * 900000000);
      groupNumber = 'GRP' + Math.floor(40000 + Math.random() * 60000);
      nameOnCard = 'David Miller';
    }

    const store = getStore();

    // Write to audit log and update patient if patientId is provided
    if (patientId) {
      store.auditLogs.push({
        id: uuid(),
        userId: userId || null,
        userName: userName || 'OCR Scanner',
        action: 'Scan Card',
        details: `Scanned insurance card image (${fileName || 'card_upload.png'}) for patient ID ${patientId}. Extracted: ${provider}, Member ID: ${memberId}.`,
        timestamp: new Date().toISOString(),
      });

      // Update patient's insurance details
      const patientIndex = store.patients.findIndex((p) => p.id === patientId);
      if (patientIndex !== -1) {
        store.patients[patientIndex] = {
          ...store.patients[patientIndex],
          insuranceProvider: provider,
          memberId,
          groupNumber,
          insuranceStatus: 'Pending', // Now has details, needs verification
        };
      }

      // Create a mock document for the scanned card
      store.documents.push({
        id: uuid(),
        patientId,
        name: fileName || 'scanned_card_front.jpg',
        fileUrl: '/mock-documents/' + (fileName || 'scanned_card_front.jpg'),
        docType: 'InsuranceCardFront',
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      extractedData: {
        provider,
        memberId,
        groupNumber,
        nameOnCard,
      },
    });
  } catch (error: any) {
    console.error('Error in OCR scan:', error);
    return NextResponse.json(
      { error: 'OCR scanning failed', details: error.message },
      { status: 500 }
    );
  }
}
