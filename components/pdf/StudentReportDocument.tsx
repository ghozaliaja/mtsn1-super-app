
import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 20,
        fontFamily: 'Helvetica',
        fontSize: 10, // Increased to 10
    },
    header: {
        marginBottom: 10,
        textAlign: 'center',
        borderBottomWidth: 1.5,
        borderBottomColor: '#000',
        paddingBottom: 5,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 3,
        textTransform: 'uppercase',
    },
    subtitle: {
        fontSize: 10,
        marginBottom: 1,
    },
    infoSection: {
        marginBottom: 10,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 2,
    },
    infoLabel: {
        width: 100, // Increased width for label
        fontWeight: 'bold',
        fontSize: 10, // Increased to 10
    },
    infoValue: {
        flex: 1,
        fontSize: 10, // Increased to 10
    },
    table: {
        width: '100%', // FORCE FULL WIDTH
        borderStyle: 'solid',
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        marginBottom: 10,
    },
    tableRow: {
        flexDirection: 'row',
        height: 20, // Increased height for larger font
        alignItems: 'center',
    },
    tableCol: {
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        height: '100%',
        justifyContent: 'center',
    },
    tableHeader: {
        backgroundColor: '#e0e0e0',
        fontWeight: 'bold',
    },
    tableCell: {
        textAlign: 'center',
        fontSize: 10, // Increased to 10
        padding: 0,
    },
    signatureSection: {
        marginTop: 15,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingRight: 40,
    },
    signatureBlock: {
        width: 150,
        alignItems: 'center',
    },
    signatureLine: {
        marginTop: 35,
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

    // Always use portrait as requested
    const orientation = 'portrait';

    return (
        <Document>
            <Page size="A4" orientation={orientation} style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Laporan {type === 'prayer' ? 'Mutabaah Ibadah' : 'Absensi Sekolah'}</Text>
                    <Text style={styles.subtitle}>MTsN 1 LABUHANBATU</Text>
                    <Text style={{ fontSize: 8, marginTop: 2, color: '#444' }}>Jl. Ki Hajar Dewantara No. 123</Text>
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
                        <View style={{ ...styles.tableCol, width: period === 'monthly' ? 30 : 80 }}>
                            <Text style={styles.tableCell}>{period === 'monthly' ? 'Tgl' : 'Tanggal'}</Text>
                        </View>
                        {type === 'prayer' ? (
                            <>
                                <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>Sbh</Text></View>
                                <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>Dha</Text></View>
                                <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>Dzh</Text></View>
                                <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>Ash</Text></View>
                                <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>Mag</Text></View>
                                <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>Isy</Text></View>
                                <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>Tah</Text></View>
                                <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>Tar</Text></View>
                                <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>Psa</Text></View>
                                <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>Qrn</Text></View>
                            </>
                        ) : (
                            <>
                                <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>Masuk</Text></View>
                                <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>Status</Text></View>
                                <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>Pulang</Text></View>
                                <View style={{ ...styles.tableCol, flex: 1 }}><Text style={styles.tableCell}>Status</Text></View>
                            </>
                        )}
                    </View>

                    {/* Table Body */}
                    {data.map((row, index) => (
                        <View key={index} style={styles.tableRow}>
                            <View style={{ ...styles.tableCol, width: period === 'monthly' ? 25 : 80 }}>
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
                        <Text style={{ marginTop: 5, fontSize: 8, color: '#888' }}>( Tanda Tangan )</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};
