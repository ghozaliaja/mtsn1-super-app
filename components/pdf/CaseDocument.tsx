
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Helvetica',
    },
    header: {
        textAlign: 'center',
        marginBottom: 20,
        borderBottom: '2px solid black',
        paddingBottom: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 12,
        marginBottom: 2,
    },
    section: {
        margin: 10,
        padding: 10,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    value: {
        fontSize: 12,
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    colLabel: {
        width: 150,
        fontSize: 12,
        fontWeight: 'bold',
    },
    colValue: {
        flex: 1,
        fontSize: 12,
    },
    signatures: {
        marginTop: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    signatureBlock: {
        alignItems: 'center',
        width: 150,
    },
    signatureLine: {
        marginTop: 50,
        borderBottom: '1px solid black',
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
                <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10, textDecoration: 'underline' }}>DATA SISWA</Text>
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
                <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10, textDecoration: 'underline' }}>DETAIL PELANGGARAN</Text>
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
                <View style={{ marginTop: 10 }}>
                    <Text style={styles.label}>Keterangan / Kronologi:</Text>
                    <Text style={styles.value}>{caseData.description || '-'}</Text>
                </View>
            </View>

            {/* Resolution Info */}
            <View style={styles.section}>
                <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10, textDecoration: 'underline' }}>PENYELESAIAN</Text>
                <View style={styles.row}>
                    <Text style={styles.colLabel}>Status</Text>
                    <Text style={styles.colValue}>: {caseData.status}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.colLabel}>Tanggal Selesai</Text>
                    <Text style={styles.colValue}>: {caseData.resolvedAt ? new Date(caseData.resolvedAt).toLocaleDateString('id-ID') : '-'}</Text>
                </View>
                <View style={{ marginTop: 10 }}>
                    <Text style={styles.label}>Hasil Konseling / Tindakan:</Text>
                    <Text style={styles.value}>{caseData.resolution || '-'}</Text>
                </View>
            </View>

            {/* Signatures */}
            <View style={styles.signatures}>
                <View style={styles.signatureBlock}>
                    <Text>Siswa</Text>
                    <View style={styles.signatureLine} />
                    <Text style={{ marginTop: 5 }}>{caseData.student.name}</Text>
                </View>

                <View style={styles.signatureBlock}>
                    <Text>Guru BK</Text>
                    <View style={styles.signatureLine} />
                    <Text style={{ marginTop: 5 }}>( ........................... )</Text>
                </View>
            </View>

            <View style={[styles.signatures, { marginTop: 30 }]}>
                <View style={styles.signatureBlock}>
                    <Text>Mengetahui,</Text>
                    <Text>Orang Tua / Wali</Text>
                    <View style={styles.signatureLine} />
                    <Text style={{ marginTop: 5 }}>( ........................... )</Text>
                </View>
            </View>

        </Page>
    </Document>
);
