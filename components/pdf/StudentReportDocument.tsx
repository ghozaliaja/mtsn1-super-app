
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 20,
        fontFamily: 'Helvetica',
        fontSize: 10,
    },
    header: {
        marginBottom: 20,
        textAlign: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#000',
        paddingBottom: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        textTransform: 'uppercase',
    },
    subtitle: {
        fontSize: 12,
        marginBottom: 2,
    },
    infoSection: {
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    infoLabel: {
        width: 100,
        fontWeight: 'bold',
    },
    infoValue: {
        flex: 1,
    },
    table: {
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        marginBottom: 20,
    },
    tableRow: {
        margin: 'auto',
        flexDirection: 'row',
    },
    tableCol: {
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        padding: 5,
    },
    tableHeader: {
        backgroundColor: '#f0f0f0',
        fontWeight: 'bold',
    },
    tableCell: {
        textAlign: 'center',
        fontSize: 9,
    },
    signatureSection: {
        marginTop: 30,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingRight: 50,
    },
    signatureBlock: {
        width: 200,
        alignItems: 'center',
    },
    signatureLine: {
        marginTop: 50,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        width: '100%',
    },
});

interface StudentReportDocumentProps {
    student: {
        name: string;
        class: string;
        nisn?: string;
    };
    data: any[];
    period: 'daily' | 'monthly';
    type: 'prayer' | 'school';
    dateTitle: string;
}

export const StudentReportDocument = ({ student, data, period, type, dateTitle }: StudentReportDocumentProps) => {

    // Determine orientation based on columns needed
    const orientation = (type === 'prayer' && period === 'monthly') ? 'landscape' : 'portrait';

    return (
        <Document>
            <Page size="A4" orientation={orientation} style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Laporan {type === 'prayer' ? 'Mutabaah Ibadah' : 'Absensi Sekolah'}</Text>
                    <Text style={styles.subtitle}>MTsN 1 LABUHANBATU</Text>
                    <Text style={{ fontSize: 10, marginTop: 4 }}>Jl. Ki Hajar Dewantara No. 123</Text>
                </View>

                {/* Student Info */}
                <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Nama Siswa</Text>
                        <Text style={styles.infoValue}>: {student.name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Kelas</Text>
                        <Text style={styles.infoValue}>: {student.class}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Periode</Text>
                        <Text style={styles.infoValue}>: {dateTitle}</Text>
                    </View>
                </View>

                {/* Table */}
                <View style={styles.table}>
                    {/* Table Header */}
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <View style={{ ...styles.tableCol, width: period === 'monthly' ? 30 : 100 }}>
                            <Text style={styles.tableCell}>{period === 'monthly' ? 'Tgl' : 'Tanggal'}</Text>
                        </View>
                        {type === 'prayer' ? (
                            <>
                                <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>Subuh</Text></View>
                                <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>Dhuha</Text></View>
                                <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>Dzuhur</Text></View>
                                <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>Ashar</Text></View>
                                <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>Maghrib</Text></View>
                                <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>Isya</Text></View>
                                <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>Tahajjud</Text></View>
                                <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>Tarawih</Text></View>
                                <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>Puasa</Text></View>
                                <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>Quran</Text></View>
                            </>
                        ) : (
                            <>
                                <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>Jam Masuk</Text></View>
                                <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>Status</Text></View>
                                <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>Jam Pulang</Text></View>
                                <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>Status</Text></View>
                            </>
                        )}
                    </View>

                    {/* Table Body */}
                    {data.map((row, index) => (
                        <View key={index} style={styles.tableRow}>
                            <View style={{ ...styles.tableCol, width: period === 'monthly' ? 30 : 100 }}>
                                <Text style={styles.tableCell}>{row.dateLabel}</Text>
                            </View>
                            {type === 'prayer' ? (
                                <>
                                    <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>{row.subuh ? 'v' : '-'}</Text></View>
                                    <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>{row.dhuha ? 'v' : '-'}</Text></View>
                                    <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>{row.dzuhur ? 'v' : '-'}</Text></View>
                                    <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>{row.ashar ? 'v' : '-'}</Text></View>
                                    <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>{row.maghrib ? 'v' : '-'}</Text></View>
                                    <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>{row.isya ? 'v' : '-'}</Text></View>
                                    <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>{row.tahajjud ? 'v' : '-'}</Text></View>
                                    <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>{row.tarawih ? 'v' : '-'}</Text></View>
                                    <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>{row.puasa ? 'v' : '-'}</Text></View>
                                    <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>{row.alquran ? 'v' : '-'}</Text></View>
                                </>
                            ) : (
                                <>
                                    <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>{row.timeIn || '-'}</Text></View>
                                    <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>{row.status || '-'}</Text></View>
                                    <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>{row.timeOut || '-'}</Text></View>
                                    <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>{row.statusOut || '-'}</Text></View>
                                </>
                            )}
                        </View>
                    ))}
                </View>

                {/* Signature */}
                <View style={styles.signatureSection}>
                    <View style={styles.signatureBlock}>
                        <Text style={{ marginBottom: 5 }}>Mengetahui,</Text>
                        <Text>Wali Murid</Text>
                        <View style={styles.signatureLine} />
                        <Text style={{ marginTop: 5, fontSize: 10 }}>( ........................................ )</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};
