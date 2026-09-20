import CourseGrid from '../components/CourseGrid'
import PageHeader from '../components/PageHeader'
import './Courses.css'

export default function Courses() {
  return (
    <div className="courses-page screen fade-up">
      <div className="container">
        <PageHeader
          title="Хөтөлбөр"
          text="Au Pair элсэлт · франц, герман хэлний бэлтгэл — New Residence 726-1"
        />
        <CourseGrid showFilters />
      </div>
    </div>
  )
}
