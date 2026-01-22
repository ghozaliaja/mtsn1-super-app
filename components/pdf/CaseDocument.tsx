
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 20,
        fontFamily: 'Helvetica',
        fontSize: 10,
    },
    header: {
        marginBottom: 10,
        textAlign: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#000',
        paddingBottom: 5,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 10,
        marginBottom: 2,
    },
    section: {
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 2,
    },
    colLabel: {
        width: 120,
        fontWeight: 'bold',
        fontSize: 10,
    },
    colValue: {
        flex: 1,
        fontSize: 10,
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 2,
        fontSize: 10,
    },
    value: {
        textAlign: 'justify',
        lineHeight: 1.4,
        fontSize: 10,
    },
    signatures: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    signatureBlock: {
        width: '40%',
        alignItems: 'center',
    },
    signatureLine: {
        marginTop: 40,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        width: '100%',
    },
});

interface CaseDocumentProps {
    caseData: any;
}

export const CaseDocument = ({ caseData }: CaseDocumentProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>BERITA ACARA BIMBINGAN KONSELING</Text>
                <Text style={styles.subtitle}>MTsN 1 LABUHANBATU</Text>
                <Text style={styles.subtitle}>Jl. Ki Hajar Dewantara No. 123</Text>
            </View>

            {/* Student Info */}
            <View style={styles.section}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 5, textDecoration: 'underline' }}>DATA SISWA</Text>
                <View style={styles.row}>
                    <Text style={styles.colLabel}>Nama Siswa</Text>
                    <Text style={styles.colValue}>: {caseData.student.name}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.colLabel}>Kelas</Text>
                    <Text style={styles.colValue}>: {caseData.student.class}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.colLabel}>NISN</Text>
                    <Text style={styles.colValue}>: {caseData.student.nisn || '-'}</Text>
                </View>
            </View>

            {/* Violation Info */}
            <View style={styles.section}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 5, textDecoration: 'underline' }}>DETAIL PELANGGARAN</Text>
                <View style={styles.row}>
                    <Text style={styles.colLabel}>Jenis Pelanggaran</Text>
                    <Text style={styles.colValue}>: {caseData.violationType}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.colLabel}>Tanggal Lapor</Text>
                    <Text style={styles.colValue}>: {new Date(caseData.createdAt).toLocaleDateString('id-ID')}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.colLabel}>Pelapor</Text>
                    <Text style={styles.colValue}>: {caseData.reporter.username}</Text>
                </View>
                <View style={{ marginTop: 5 }}>
                    <Text style={styles.label}>Keterangan / Kronologi:</Text>
                    <Text style={styles.value}>{caseData.description || '-'}</Text>
                </View>
            </View>

            {/* Resolution Info */}
            <View style={styles.section}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 5, textDecoration: 'underline' }}>PENYELESAIAN</Text>
                <View style={styles.row}>
                    <Text style={styles.colLabel}>Status</Text>
                    <Text style={styles.colValue}>: {caseData.status}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.colLabel}>Tanggal Selesai</Text>
                    <Text style={styles.colValue}>: {caseData.resolvedAt ? new Date(caseData.resolvedAt).toLocaleDateString('id-ID') : '-'}</Text>
                </View>
                <View style={{ marginTop: 5 }}>
                    <Text style={styles.label}>Hasil Konseling / Tindakan:</Text>
                    <Text style={styles.value}>{caseData.resolution || '-'}</Text>
                </View>
            </View>

            {/* Signatures - Compacted */}
            <View style={styles.signatures}>
                <View style={styles.signatureBlock}>
                    <Text>Siswa</Text>
                    <View style={styles.signatureLine} />
                    <Text style={{ marginTop: 5, fontSize: 10 }}>{caseData.student.name}</Text>
                </View>

                <View style={styles.signatureBlock}>
                    <Text>Guru BK</Text>
                    <View style={styles.signatureLine} />
                    <Text style={{ marginTop: 5, fontSize: 10 }}>( ........................... )</Text>
                </View>
            </View>

            {/* Parent Signature - Removed as per request to fit one page if needed, but let's try to keep it if space permits. 
                Actually, user asked to remove it if needed. 
                I will remove it to be safe and ensure 1 page, as requested "tanda tangan orang tua dihilangkan?".
                Or I can put it in the middle bottom.
                Let's remove it for now to guarantee 1 page fit, as the user seemed okay with it.
            */}
        </Page>
    </Document>
);
