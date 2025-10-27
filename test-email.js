const { sendMail } = require('./utils/sendMailHandler');

async function testEmail() {
    try {
        console.log('Bắt đầu test gửi email...');
        
        // Thông tin test
        const testEmail = 'test@example.com'; // Email bất kỳ (Mailtrap sẽ bắt tất cả)
        const testUrl = 'http://localhost:3000/auth/resetpassword/abc123token';
        
        // Gửi email
        await sendMail(testEmail, testUrl);
        
        console.log('✅ Email đã được gửi thành công!');
        console.log('📧 Email test đã được gửi đến:', testEmail);
        console.log('🔗 URL trong email:', testUrl);
        console.log('📬 Vào Mailtrap inbox để xem email test này.');
        
    } catch (error) {
        console.error('❌ Lỗi khi gửi email:', error.message);
        console.error('Chi tiết lỗi:', error);
    }
}

// Chạy test
testEmail();