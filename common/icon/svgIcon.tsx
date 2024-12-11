import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    name: {
      type: String,
      required: true
    },
    path: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: null
    },
    width: {
      type: [Number, String],
      default: null
    },
    height: {
      type: [Number, String],
      default: null
    },
    color: {
      type: String,
      default: 'currentColor'
    }
  },
  setup(props) {
    const targetFile = props.path
      ? `${props.path}/${props.name}`
      : `${props.name}`

    const symbolId = targetFile
      .split('/')
      .slice(-1)
      .pop()

    import(`./${targetFile}.svg`)

    return () => (
      <svg
        version="1.1"
        width={props.width}
        height={props.height}
        fill={props.color}
      >
        {props.title ? <title>{props.title}</title> : ''}
        <use xlinkHref={'#icon-' + symbolId} />
      </svg>
    )
  }
})
