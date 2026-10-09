import CourseGrid from '../components/CourseGrid'
import PageHeader from '../components/PageHeader'
import './Courses.css'

export default function Courses() {
  return (
    <div className="courses-page screen fade-up">
      <div className="container">
        <PageHeader
          title="Хөтөлбөр"
          text="Герман хэлний A1, A2 анги · Au Pair бэлтгэл"
        />
        <CourseGrid showFilters />
      </div>
    </div>
  )
}
