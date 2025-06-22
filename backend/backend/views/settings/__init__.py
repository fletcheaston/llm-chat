from ninja import Router

from . import update

router = Router()


router.add_router("/update", update.router, tags=["settings"])
