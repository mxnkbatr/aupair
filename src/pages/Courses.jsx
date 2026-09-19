import CourseGrid from '../components/CourseGrid'
import PageHeader from '../components/PageHeader'
import './Courses.css'

export default function Courses() {
  return (
    <div className="courses-page screen fade-up">
      <div className="container">
        <PageHeader
          title="Сургалт"
          text="HSK 1–5 · эрчимжүүлсэн · ганцаарчилсан — Union Building 1204"
        />
        <CourseGrid showFilters />
      </div>
    </div>
  )
}
