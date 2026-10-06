import { Link } from 'react-router-dom'
import { social } from '../data'
import './Privacy.css'

export default function Privacy() {
  return (
    <div className="privacy-page screen fade-up">
      <div className="container">
        <header className="privacy-hero">
          <p className="eyebrow">Privacy · Нууцлал</p>
          <h1>Нууцлалын бодлого</h1>
          <p>Privacy Policy · Mongolian Au Pair</p>
          <p className="privacy-updated">Сүүлд шинэчилсэн / Last updated: 2026-10-06</p>
        </header>

        <section className="privacy-block" lang="mn">
          <h2>Монгол хэл</h2>
          <h3>1. Бид хэн бэ</h3>
          <p>
            Mongolian Au Pair («бид», «манай») нь Au Pair хөтөлбөр, герман хэлний сургалт болон
            холбоотой үйлчилгээ үзүүлдэг байгууллага юм. Энэхүү бодлого нь апп болон вэбсайтаар
            цуглуулсан хувийн мэдээллийг хэрхэн ашиглахыг тайлбарлана.
          </p>

          <h3>2. Ямар мэдээлэл цуглуулдаг вэ</h3>
          <ul>
            <li>Нэр</li>
            <li>Утасны дугаар (нэвтрэх нэр)</li>
            <li>Имэйл (заавал биш)</li>
            <li>Нас</li>
            <li>Герман хэлний түвшин</li>
            <li>Элсэлтийн тэмдэглэл / тэмдэглэгээ</li>
            <li>Холбоо барих маягтын зурвас</li>
            <li>Дэлгүүрийн захиалгын түүх</li>
          </ul>

          <h3>3. Юунд ашигладаг вэ</h3>
          <p>
            Мэдээллийг зөвхөн үйлчилгээ үзүүлэхэд ашиглана: элсэлт бүртгэх, захиалга боловсруулах,
            тантай холбогдох. Бид мэдээллийг зараагүй, гуравдагч этгээдэд хуваалцдаггүй. Зар
            сурталчилгаа, хяналт/аналитик (tracking) ашигладаггүй.
          </p>

          <h3>4. Хадгалалт</h3>
          <p>
            Өгөгдлийг MongoDB дээр хадгална. Хандалтыг зөвхөн үйлчилгээ үзүүлэхэд шаардлагатай
            хүрээнд хязгаарлана.
          </p>

          <h3>5. Бүртгэл устгах</h3>
          <p>
            Та бүртгэлээ хүссэн үедээ устгаж болно:{' '}
            <Link to="/profile">Профайл → Тохиргоо → Бүртгэл устгах</Link>. Эсвэл{' '}
            <a href={`mailto:${social.email}`}>{social.email}</a> хаягаар хүсэлт илгээнэ үү.
            Устгасны дараа бүртгэл болон холбоотой хувийн мэдээлэл бүрмөсөн устана.
          </p>

          <h3>6. Холбоо барих</h3>
          <p>
            {social.email}
            <br />
            {social.phone}
            <br />
            {social.address || 'Улаанбаатар'}
          </p>
        </section>

        <section className="privacy-block" lang="en">
          <h2>English</h2>
          <h3>1. Who we are</h3>
          <p>
            Mongolian Au Pair (“we”, “our”) provides Au Pair programs, German language courses, and
            related services. This policy explains how we handle personal data collected through our
            app and website.
          </p>

          <h3>2. What we collect</h3>
          <ul>
            <li>Name</li>
            <li>Phone number (used to sign in)</li>
            <li>Email (optional)</li>
            <li>Age</li>
            <li>German language level</li>
            <li>Enrollment notes</li>
            <li>Contact-form messages</li>
            <li>Shop order history</li>
          </ul>

          <h3>3. How we use it</h3>
          <p>
            We use this data only to provide our services: enrollments, orders, and contacting you.
            We do not sell personal data, do not share it with third parties, and do not use ads or
            tracking/analytics.
          </p>

          <h3>4. Storage</h3>
          <p>
            Data is stored in MongoDB. Access is limited to what is needed to operate the service.
          </p>

          <h3>5. Account deletion</h3>
          <p>
            You can delete your account anytime in{' '}
            <Link to="/profile">Profile → Settings → Delete account</Link>, or by emailing{' '}
            <a href={`mailto:${social.email}`}>{social.email}</a>. After deletion, your account and
            related personal data are permanently removed.
          </p>

          <h3>6. Contact</h3>
          <p>
            {social.email}
            <br />
            {social.phone}
            <br />
            {social.address || 'Ulaanbaatar'}
          </p>
        </section>
      </div>
    </div>
  )
}
